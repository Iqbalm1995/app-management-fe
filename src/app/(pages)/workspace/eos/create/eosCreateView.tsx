"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftAddon,
  InputLeftElement,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Spacer,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  Tooltip,
  useColorMode,
  useToast,
  VStack,
} from "@chakra-ui/react";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiImage,
  FiInfo,
  FiLayers,
  FiMail,
  FiPhone,
  FiPlus,
  FiSave,
  FiTrash2,
  FiUploadCloud,
  FiUser,
  FiUsers,
  FiX,
  FiZap,
} from "react-icons/fi";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent, HeaderContentProps } from "@/app/components/headerContent";
import { useDocumentTitle } from "@/app/hooks/useDocumentTitle";
import { radiusStyle } from "@/app/constants/applicationConstants";
import ApplicationSearchDropdown from "../components/ApplicationSearchDropdown";
import {
  ApplicationOption,
  DIVISION_OPTIONS,
  IBC_ERROR_CODES,
  IncidentPriority,
  IncidentStatus,
  INITIAL_APPLICATIONS,
  IT_GROUP_OPTIONS,
  ProblemCategory,
  SolutionType,
} from "../types";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Buat Laporan Incident EoS Baru",
  breadCrumb: ["Home", "Workspace", "EOS", "Buat Incident"],
};

export default function EosCreateView() {
  useDocumentTitle("Buat Incident — Engineer on Support (EOS)");
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();

  const [selectedAppId, setSelectedAppId] = useState<string>(() => {
    const urlParam = searchParams.get("appId");
    if (urlParam && INITIAL_APPLICATIONS.some((a) => a.id === urlParam)) {
      return urlParam;
    }
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("eos_selected_app_id");
      if (saved && INITIAL_APPLICATIONS.some((a) => a.id === saved)) {
        return saved;
      }
    }
    return INITIAL_APPLICATIONS[0].id;
  });

  const [selectedApp, setSelectedApp] = useState<ApplicationOption>(() => {
    const match = INITIAL_APPLICATIONS.find((a) => a.id === selectedAppId);
    return match || INITIAL_APPLICATIONS[0];
  });

  React.useEffect(() => {
    const urlParam = searchParams.get("appId");
    if (urlParam) {
      setSelectedAppId(urlParam);
      const match = INITIAL_APPLICATIONS.find((a) => a.id === urlParam);
      if (match) setSelectedApp(match);
    } else if (typeof window !== "undefined") {
      const saved = localStorage.getItem("eos_selected_app_id");
      if (saved) {
        setSelectedAppId(saved);
        const match = INITIAL_APPLICATIONS.find((a) => a.id === saved);
        if (match) setSelectedApp(match);
      }
    }
  }, [searchParams]);

  const handleAppChange = (appId: string) => {
    setSelectedAppId(appId);
    if (typeof window !== "undefined") {
      localStorage.setItem("eos_selected_app_id", appId);
    }
  };

  // 2. PIC Pelapor State
  const [pelaporNama, setPelaporNama] = useState<string>("");
  const [pelaporNoTelp, setPelaporNoTelp] = useState<string>("");
  const [pelaporEmail, setPelaporEmail] = useState<string>("");
  const [pelaporDivisi, setPelaporDivisi] = useState<string>(DIVISION_OPTIONS[0]);

  // 3. PIC EoS State
  const [eosNama, setEosNama] = useState<string>("");
  const [eosNoTelp, setEosNoTelp] = useState<string>("");
  const [eosEmail, setEosEmail] = useState<string>("");
  const [eosGrup, setEosGrup] = useState<string>(IT_GROUP_OPTIONS[0]);

  // 4. Problem Detail State
  const [reportDate, setReportDate] = useState<string>(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [errorDateStart, setErrorDateStart] = useState<string>(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset() - 30);
    return now.toISOString().slice(0, 16);
  });
  const [errorDateEnd, setErrorDateEnd] = useState<string>("");
  const [problemRuntimeHours, setProblemRuntimeHours] = useState<number>(0);
  const [problemRuntimeMinutes, setProblemRuntimeMinutes] = useState<number>(30);

  const [errorCode, setErrorCode] = useState<string>(IBC_ERROR_CODES[0].code);
  const [errorCodeOther, setErrorCodeOther] = useState<string>("");
  const [errorDescription, setErrorDescription] = useState<string>(IBC_ERROR_CODES[0].description);
  const [jenisSurrounding, setJenisSurrounding] = useState<string>(IBC_ERROR_CODES[0].defaultSurrounding);
  const [jenisSurroundingOther, setJenisSurroundingOther] = useState<string>("");
  const [problemCategory, setProblemCategory] = useState<ProblemCategory>(IBC_ERROR_CODES[0].defaultCategory);
  const [problemCategoryOther, setProblemCategoryOther] = useState<string>("");
  const [priorityIncident, setPriorityIncident] = useState<IncidentPriority>("HIGH");
  const [problemDescription, setProblemDescription] = useState<string>("");

  // Attachments
  const [problemCapture, setProblemCapture] = useState<{ name: string; url: string } | null>(null);
  const [problemLogText, setProblemLogText] = useState<string>("");
  const [problemLogFile, setProblemLogFile] = useState<{ name: string } | null>(null);

  // 5. Solution Detail State
  const [hasSolution, setHasSolution] = useState<boolean>(false);
  const [jenisSolution, setJenisSolution] = useState<SolutionType>("Temporary");
  const [tindakLanjut, setTindakLanjut] = useState<string>("");
  const [solvedDateStart, setSolvedDateStart] = useState<string>("");
  const [solvedDateEnd, setSolvedDateEnd] = useState<string>("");
  const [solutionRuntimeHours, setSolutionRuntimeHours] = useState<number>(0);
  const [solutionRuntimeMinutes, setSolutionRuntimeMinutes] = useState<number>(15);
  const [solvedBy, setSolvedBy] = useState<string>("");
  const [solutionGrup, setSolutionGrup] = useState<string>("");
  const [solutionDescription, setSolutionDescription] = useState<string>("");
  const [solutionCapture, setSolutionCapture] = useState<{ name: string; url: string } | null>(null);
  const [solutionLogText, setSolutionLogText] = useState<string>("");
  const [solutionLogFile, setSolutionLogFile] = useState<{ name: string } | null>(null);

  // 6. Status Incident & Remark State
  const [statusIncident, setStatusIncident] = useState<IncidentStatus>("Open");
  const [remark, setRemark] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handle Error Code Selection (Auto-feeds Error Description & Surrounding)
  const handleErrorCodeChange = (code: string) => {
    setErrorCode(code);
    const found = IBC_ERROR_CODES.find((c) => c.code === code);
    if (found) {
      if (code !== "OTHER") {
        setErrorDescription(found.description);
        setJenisSurrounding(found.defaultSurrounding);
        setProblemCategory(found.defaultCategory);
      } else {
        setErrorDescription("");
        setJenisSurrounding("");
        setProblemCategory("Other");
      }
    }
  };

  // Handle Phone input with +62 template
  const handlePhoneChange = (
    val: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    let cleaned = val;
    if (cleaned.startsWith("+62")) {
      cleaned = cleaned.slice(3).trim();
    } else if (cleaned.startsWith("62")) {
      cleaned = cleaned.slice(2).trim();
    } else if (cleaned.startsWith("0")) {
      cleaned = cleaned.slice(1).trim();
    }
    setter(cleaned);
  };

  // Mock File Upload Handlers
  const handleSimulateUpload = (
    type: "problemCapture" | "problemLog" | "solutionCapture" | "solutionLog",
    file?: File
  ) => {
    const fileName = file ? file.name : `screenshot_sample_${Date.now()}.png`;
    const fakeUrl = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80";

    if (type === "problemCapture") {
      setProblemCapture({ name: fileName, url: fakeUrl });
    } else if (type === "problemLog") {
      setProblemLogFile({ name: file ? file.name : `stacktrace_${Date.now()}.log` });
    } else if (type === "solutionCapture") {
      setSolutionCapture({ name: fileName, url: fakeUrl });
    } else if (type === "solutionLog") {
      setSolutionLogFile({ name: file ? file.name : `solution_verify_${Date.now()}.log` });
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pelaporNama.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Nama PIC Pelapor wajib diisi.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!problemDescription.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Problem Description wajib diisi.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (hasSolution && jenisSolution === "Temporary" && !tindakLanjut.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Field Tindak Lanjut wajib diisi untuk Solution Temporary.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Berhasil Menyimpan Incident",
        description: `Incident EOS untuk aplikasi ${selectedApp.name} telah berhasil dicatat.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push(`/workspace/eos?appId=${selectedApp.id}`);
    }, 600);
  };

  return (
    <LayoutAdmin>
      <Box p={{ base: 3, md: 5 }}>
        <HeaderContent {...HeaderDataContent} />

        {/* ════════════════════════════════════════════════════════════
            BLUE HEADER HERO SECTION (MATCHING PROJECT STYLE)
            ════════════════════════════════════════════════════════════ */}
        <Box
          bgGradient="linear(to-br, secondary.800, secondary.600)"
          color="white"
          px={{ base: 5, md: 7 }}
          py={{ base: 5, md: 6 }}
          mt={3}
          mb={5}
          rounded="xl"
          position="relative"
          overflow="hidden"
          shadow="md"
        >
          {/* Subtle Ambient Shapes */}
          <Box
            position="absolute"
            top="-30px"
            right="-30px"
            w="160px"
            h="160px"
            bg="whiteAlpha.100"
            rounded="full"
            pointerEvents="none"
          />
          <Box
            position="absolute"
            bottom="-40px"
            right="220px"
            w="120px"
            h="120px"
            bg="whiteAlpha.080"
            transform="rotate(45deg)"
            pointerEvents="none"
          />

          <VStack align="stretch" spacing={4} position="relative" zIndex={1}>
            <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} gap={3}>
              <HStack spacing={3} align="center">
                <Tooltip label="Kembali ke Daftar Incident" hasArrow placement="top">
                  <IconButton
                    aria-label="Kembali ke Daftar Incident"
                    icon={<FiArrowLeft />}
                    variant="ghost"
                    size="md"
                    color="white"
                    bg="whiteAlpha.200"
                    backdropFilter="blur(10px)"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    _hover={{ bg: "whiteAlpha.350", transform: "translateX(-2px)" }}
                    rounded="full"
                    onClick={() => router.push(`/workspace/eos?appId=${selectedAppId}`)}
                    transition="all 0.2s ease"
                  />
                </Tooltip>

                <VStack align="start" spacing={1}>
                  <HStack spacing={2} wrap="wrap">
                    <Heading size="md" color="white" fontWeight="800">
                      Buat Laporan Incident EoS Baru
                    </Heading>
                    <Badge bg="white" color="blue.800" fontSize="xs" px={2.5} py={0.5} rounded="md" fontWeight="bold">
                      {selectedApp.code}
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color="whiteAlpha.900">
                    Form pencatatan insiden &amp; penanganan teknis oleh tim Engineer on Support.
                  </Text>
                </VStack>
              </HStack>

              <HStack spacing={3}>
                <Button
                  size="sm"
                  bg="whiteAlpha.200"
                  color="white"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  _hover={{ bg: "whiteAlpha.300" }}
                  onClick={() => router.push(`/workspace/eos?appId=${selectedAppId}`)}
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  bg="white"
                  color="blue.800"
                  leftIcon={<FiSave />}
                  _hover={{ bg: "blue.50", transform: "translateY(-1px)" }}
                  _active={{ transform: "scale(0.98)" }}
                  fontWeight="bold"
                  shadow="md"
                  isLoading={isSubmitting}
                  loadingText="Menyimpan..."
                  onClick={handleSubmit}
                >
                  Simpan Incident
                </Button>
              </HStack>
            </Flex>
          </VStack>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack spacing={5} align="stretch">

            {/* ════════════════════════════════════════════════════════════
                SECTION 1: PILIH APLIKASI
                ════════════════════════════════════════════════════════════ */}
            <Card
              bg={isDark ? "secondary.900" : "white"}
              rounded={radiusStyle}
              shadow="sm"
              border="2px solid"
              borderColor={isDark ? "blue.600" : "blue.500"}
            >
              <CardBody p={{ base: 4, md: 5 }}>
                <HStack spacing={3} mb={3} align="center">
                  <Icon as={FiLayers} boxSize={5} color="blue.500" />
                  <VStack align="start" spacing={0}>
                    <Heading size="sm">1. Pilih Aplikasi yang Mengalami Incident</Heading>
                    <Text fontSize="xs" color="gray.500">
                      Pilih aplikasi utama yang mengalami kendala sistem atau surrounding error.
                    </Text>
                  </VStack>
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} alignItems="center">
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold">Aplikasi</FormLabel>
                    <ApplicationSearchDropdown
                      selectedAppId={selectedAppId}
                      onSelectApp={(app) => {
                        handleAppChange(app.id);
                        setSelectedApp(app);
                      }}
                      triggerVariant="form"
                      onSelectedAppLoaded={(app) => {
                        if (app.id === selectedAppId && selectedApp.id !== app.id) {
                          setSelectedApp(app);
                        }
                      }}
                    />
                  </FormControl>

                  {/* Summary Card of Selected App */}
                  <Box
                    p={3.5}
                    rounded="lg"
                    border="1px solid"
                    borderColor={isDark ? "blue.800" : "blue.100"}
                    bg={isDark ? "blue.950" : "blue.50"}
                  >
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={0.5}>
                        <Text fontSize="xs" fontWeight="extrabold" color="blue.700">
                          {selectedApp.name}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          Owner: <b>{selectedApp.owner}</b> • {selectedApp.division}
                        </Text>
                      </VStack>
                      <HStack spacing={2}>
                        <Badge colorScheme={selectedApp.tier === "Critical" ? "red" : "blue"} px={2} py={0.5} rounded="md" fontSize="xs">
                          {selectedApp.tier}
                        </Badge>
                        <Badge colorScheme="purple" px={2} py={0.5} rounded="md" fontSize="xs">
                          {selectedApp.code}
                        </Badge>
                      </HStack>
                    </Flex>
                  </Box>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* ════════════════════════════════════════════════════════════
                SECTION 2: INFORMASI PIC (PELAPOR & EOS)
                ════════════════════════════════════════════════════════════ */}
            <Card
              bg={isDark ? "secondary.900" : "white"}
              rounded={radiusStyle}
              shadow="sm"
              border="1px solid"
              borderColor={isDark ? "secondary.700" : "blue.100"}
            >
              <CardBody p={{ base: 4, md: 5 }}>
                <HStack spacing={3} mb={4} align="center">
                  <Icon as={FiUsers} boxSize={5} color="blue.500" />
                  <VStack align="start" spacing={0}>
                    <Heading size="sm">2. Informasi PIC (Pelapor &amp; Engineer on Support)</Heading>
                    <Text fontSize="xs" color="gray.500">
                      Identitas pihak pelapor kejadian serta Engineer on Support yang menangani.
                    </Text>
                  </VStack>
                </HStack>

                <VStack spacing={4} align="stretch">
                  {/* Block 1: PIC Pelapor */}
                  <Box p={4} rounded="lg" border="1px solid" borderColor={isDark ? "blue.800" : "blue.200"} bg={isDark ? "blue.950" : "blue.50"}>
                    <HStack spacing={2} mb={3}>
                      <Icon as={FiUser} color="blue.500" />
                      <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="blue.600">
                        PIC Pelapor
                      </Heading>
                    </HStack>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Nama Lengkap</FormLabel>
                        <Input
                          size="sm"
                          rounded="md"
                          placeholder="Contoh: Arya Wiguna"
                          value={pelaporNama}
                          onChange={(e) => setPelaporNama(e.target.value)}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">No. Telp</FormLabel>
                        <InputGroup size="sm">
                          <InputLeftAddon
                            bg={isDark ? "secondary.800" : "gray.100"}
                            borderColor={isDark ? "secondary.700" : "inherit"}
                            color={isDark ? "gray.300" : "gray.700"}
                            fontSize="xs"
                            fontWeight="semibold"
                            px={3}
                          >
                            +62
                          </InputLeftAddon>
                          <Input
                            roundedRight="md"
                            type="tel"
                            placeholder="812-xxxx-xxxx"
                            value={pelaporNoTelp}
                            onChange={(e) => handlePhoneChange(e.target.value, setPelaporNoTelp)}
                          />
                        </InputGroup>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">Email</FormLabel>
                        <InputGroup size="sm">
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FiMail} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            rounded="md"
                            type="email"
                            placeholder="nama@bankbjb.co.id"
                            value={pelaporEmail}
                            onChange={(e) => setPelaporEmail(e.target.value)}
                          />
                        </InputGroup>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Divisi</FormLabel>
                        <Select
                          size="sm"
                          rounded="md"
                          value={pelaporDivisi}
                          onChange={(e) => setPelaporDivisi(e.target.value)}
                        >
                          {DIVISION_OPTIONS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </Box>

                  {/* Block 2: PIC EoS */}
                  <Box p={4} rounded="lg" border="1px solid" borderColor={isDark ? "orange.800" : "orange.200"} bg={isDark ? "orange.950" : "orange.50"}>
                    <HStack spacing={2} mb={3}>
                      <Icon as={FiZap} color="orange.500" />
                      <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="orange.600">
                        PIC EoS (Engineer on Support)
                      </Heading>
                    </HStack>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Nama Lengkap</FormLabel>
                        <Input
                          size="sm"
                          rounded="md"
                          placeholder="Contoh: Dedi Supriyadi"
                          value={eosNama}
                          onChange={(e) => setEosNama(e.target.value)}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">No. Telp</FormLabel>
                        <InputGroup size="sm">
                          <InputLeftAddon
                            bg={isDark ? "secondary.800" : "gray.100"}
                            borderColor={isDark ? "secondary.700" : "inherit"}
                            color={isDark ? "gray.300" : "gray.700"}
                            fontSize="xs"
                            fontWeight="semibold"
                            px={3}
                          >
                            +62
                          </InputLeftAddon>
                          <Input
                            roundedRight="md"
                            type="tel"
                            placeholder="813-xxxx-xxxx"
                            value={eosNoTelp}
                            onChange={(e) => handlePhoneChange(e.target.value, setEosNoTelp)}
                          />
                        </InputGroup>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">Email</FormLabel>
                        <InputGroup size="sm">
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FiMail} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            rounded="md"
                            type="email"
                            placeholder="engineer.eos@bankbjb.co.id"
                            value={eosEmail}
                            onChange={(e) => setEosEmail(e.target.value)}
                          />
                        </InputGroup>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Grup IT</FormLabel>
                        <Select
                          size="sm"
                          rounded="md"
                          value={eosGrup}
                          onChange={(e) => setEosGrup(e.target.value)}
                        >
                          {IT_GROUP_OPTIONS.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            {/* ════════════════════════════════════════════════════════════
                SECTION 3: PROBLEM DETAIL
                ════════════════════════════════════════════════════════════ */}
            <Card
              bg={isDark ? "secondary.900" : "white"}
              rounded={radiusStyle}
              shadow="sm"
              border="1px solid"
              borderColor={isDark ? "secondary.700" : "blue.100"}
            >
              <CardBody p={{ base: 4, md: 5 }}>
                <HStack spacing={3} mb={4} align="center">
                  <Icon as={FiAlertTriangle} boxSize={5} color="red.500" />
                  <VStack align="start" spacing={0}>
                    <Heading size="sm">3. Problem Detail</Heading>
                    <Text fontSize="xs" color="gray.500">
                      Rincian error code, surrounding terdampak, runtime durasi, deskripsi dan bukti log/screenshot.
                    </Text>
                  </VStack>
                </HStack>

                <VStack spacing={4} align="stretch">
                  {/* Row 1: Report Date & Error Date Range & Runtime */}
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="bold">Report Date (Waktu Lapor)</FormLabel>
                      <Input
                        size="sm"
                        rounded="md"
                        type="datetime-local"
                        value={reportDate}
                        onChange={(e) => setReportDate(e.target.value)}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="bold">Error Date (Mulai Kejadian)</FormLabel>
                      <Input
                        size="sm"
                        rounded="md"
                        type="datetime-local"
                        value={errorDateStart}
                        onChange={(e) => setErrorDateStart(e.target.value)}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="bold">Error Date (Selesai Kejadian)</FormLabel>
                      <Input
                        size="sm"
                        rounded="md"
                        type="datetime-local"
                        value={errorDateEnd}
                        onChange={(e) => setErrorDateEnd(e.target.value)}
                      />
                      <FormHelperText fontSize="xs">Opsional jika insiden masih berjalan</FormHelperText>
                    </FormControl>
                  </SimpleGrid>

                  {/* Runtime Duration Display */}
                  <Box p={3} rounded="md" border="1px solid" borderColor={isDark ? "blue.800" : "blue.200"} bg={isDark ? "blue.950" : "blue.50"}>
                    <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "start", sm: "center" }} gap={2}>
                      <HStack spacing={2}>
                        <Icon as={FiClock} color="blue.500" />
                        <Text fontSize="xs" fontWeight="bold">Runtime Durasi Insiden:</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <HStack spacing={1}>
                          <Input
                            size="xs"
                            w="60px"
                            type="number"
                            min={0}
                            value={problemRuntimeHours}
                            onChange={(e) => setProblemRuntimeHours(parseInt(e.target.value) || 0)}
                          />
                          <Text fontSize="xs">Jam</Text>
                        </HStack>
                        <HStack spacing={1}>
                          <Input
                            size="xs"
                            w="60px"
                            type="number"
                            min={0}
                            max={59}
                            value={problemRuntimeMinutes}
                            onChange={(e) => setProblemRuntimeMinutes(parseInt(e.target.value) || 0)}
                          />
                          <Text fontSize="xs">Menit</Text>
                        </HStack>
                        <Badge colorScheme="blue" px={2.5} py={0.5} rounded="md" fontSize="xs">
                          Total: {problemRuntimeHours}j {problemRuntimeMinutes}m
                        </Badge>
                      </HStack>
                    </Flex>
                  </Box>

                  {/* Row 2: Error Code (Feeding from Database IBC) & Jenis Surrounding */}
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <HStack justify="space-between" mb={1}>
                        <FormLabel fontSize="xs" fontWeight="bold" mb={0}>
                          Error Code (Database IBC)
                        </FormLabel>
                        <Badge colorScheme="purple" fontSize="xs">IBC Data Feed</Badge>
                      </HStack>
                      <Select
                        size="sm"
                        rounded="md"
                        value={errorCode}
                        onChange={(e) => handleErrorCodeChange(e.target.value)}
                      >
                        {IBC_ERROR_CODES.map((opt) => (
                          <option key={opt.code} value={opt.code}>
                            {opt.code} — {opt.description.slice(0, 50)}...
                          </option>
                        ))}
                      </Select>
                      {errorCode === "OTHER" && (
                        <Input
                          mt={2}
                          size="sm"
                          rounded="md"
                          placeholder="Masukkan Error Code kustom..."
                          value={errorCodeOther}
                          onChange={(e) => setErrorCodeOther(e.target.value)}
                        />
                      )}
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="bold">
                        Jenis Surrounding (Sistem / Gateway Terkait)
                      </FormLabel>
                      <Input
                        size="sm"
                        rounded="md"
                        placeholder="Contoh: Core Banking Host (ISO 8583)"
                        value={jenisSurrounding}
                        onChange={(e) => setJenisSurrounding(e.target.value)}
                      />
                      <FormHelperText fontSize="xs">
                        Terisi otomatis berdasarkan error code atau dapat disesuaikan
                      </FormHelperText>
                    </FormControl>
                  </SimpleGrid>

                  {/* Row 3: Error Description & Problem Kategori */}
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="bold">Error Description</FormLabel>
                      <Textarea
                        rows={2}
                        size="sm"
                        rounded="md"
                        placeholder="Deskripsi detail error..."
                        value={errorDescription}
                        onChange={(e) => setErrorDescription(e.target.value)}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="bold">Problem Kategori</FormLabel>
                      <RadioGroup
                        value={problemCategory}
                        onChange={(val) => setProblemCategory(val as ProblemCategory)}
                      >
                        <SimpleGrid columns={{ base: 2, sm: 2 }} spacing={2} pt={1}>
                          <Radio value="Error App" size="sm">Error App</Radio>
                          <Radio value="Error Surrounding" size="sm">Error Surrounding</Radio>
                          <Radio value="Human Error" size="sm">Human Error</Radio>
                          <Radio value="Other" size="sm">Other</Radio>
                        </SimpleGrid>
                      </RadioGroup>
                      {problemCategory === "Other" && (
                        <Input
                          mt={2}
                          size="sm"
                          rounded="md"
                          placeholder="Kategori spesifik lainnya..."
                          value={problemCategoryOther}
                          onChange={(e) => setProblemCategoryOther(e.target.value)}
                        />
                      )}
                    </FormControl>
                  </SimpleGrid>

                  {/* Row: Priority Incident */}
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold">Priority Incident</FormLabel>
                    <RadioGroup
                      value={priorityIncident}
                      onChange={(val) => setPriorityIncident(val as IncidentPriority)}
                    >
                      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3} pt={1}>
                        <Box
                          p={2.5}
                          rounded="md"
                          border="1px solid"
                          borderColor={priorityIncident === "HIGH" ? "red.400" : isDark ? "secondary.700" : "gray.200"}
                          bg={priorityIncident === "HIGH" ? (isDark ? "red.950" : "red.50") : "transparent"}
                          cursor="pointer"
                          onClick={() => setPriorityIncident("HIGH")}
                          transition="all 0.15s ease"
                        >
                          <Radio value="HIGH" colorScheme="red" size="sm">
                            <VStack align="start" spacing={0} ml={1}>
                              <Badge colorScheme="red" fontSize="xs" px={2} py={0.5} rounded="md">HIGH</Badge>
                              <Text fontSize="10px" color="gray.500" mt={0.5}>Dampak masif / fatal operasional</Text>
                            </VStack>
                          </Radio>
                        </Box>

                        <Box
                          p={2.5}
                          rounded="md"
                          border="1px solid"
                          borderColor={priorityIncident === "MEDIUM" ? "orange.400" : isDark ? "secondary.700" : "gray.200"}
                          bg={priorityIncident === "MEDIUM" ? (isDark ? "orange.950" : "orange.50") : "transparent"}
                          cursor="pointer"
                          onClick={() => setPriorityIncident("MEDIUM")}
                          transition="all 0.15s ease"
                        >
                          <Radio value="MEDIUM" colorScheme="orange" size="sm">
                            <VStack align="start" spacing={0} ml={1}>
                              <Badge colorScheme="orange" fontSize="xs" px={2} py={0.5} rounded="md">MEDIUM</Badge>
                              <Text fontSize="10px" color="gray.500" mt={0.5}>Kendala sebagian modul</Text>
                            </VStack>
                          </Radio>
                        </Box>

                        <Box
                          p={2.5}
                          rounded="md"
                          border="1px solid"
                          borderColor={priorityIncident === "LOW" ? "green.400" : isDark ? "secondary.700" : "gray.200"}
                          bg={priorityIncident === "LOW" ? (isDark ? "green.950" : "green.50") : "transparent"}
                          cursor="pointer"
                          onClick={() => setPriorityIncident("LOW")}
                          transition="all 0.15s ease"
                        >
                          <Radio value="LOW" colorScheme="green" size="sm">
                            <VStack align="start" spacing={0} ml={1}>
                              <Badge colorScheme="green" fontSize="xs" px={2} py={0.5} rounded="md">LOW</Badge>
                              <Text fontSize="10px" color="gray.500" mt={0.5}>Gangguan minor / kosmetik</Text>
                            </VStack>
                          </Radio>
                        </Box>
                      </SimpleGrid>
                    </RadioGroup>
                  </FormControl>

                  {/* Row 4: Problem Description */}
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold">Problem Description (Kronologi Kejadian)</FormLabel>
                    <Textarea
                      rows={3}
                      size="sm"
                      rounded="md"
                      placeholder="Jelaskan secara kronologis alur kejadian kendala, dampak pada operasional cabang/nasabah, dan pesan error yang tampil..."
                      value={problemDescription}
                      onChange={(e) => setProblemDescription(e.target.value)}
                    />
                  </FormControl>

                  {/* Row 5: Attachments (Problem Capture & Logs) */}
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {/* Problem Capture (Image) */}
                    <Box p={3.5} rounded="md" border="1px dashed" borderColor={isDark ? "blue.700" : "blue.200"} bg={isDark ? "blue.950" : "white"}>
                      <HStack justify="space-between" mb={2}>
                        <HStack spacing={1.5}>
                          <Icon as={FiImage} color="blue.500" />
                          <Text fontSize="xs" fontWeight="bold">Problem Capture (Screenshot)</Text>
                        </HStack>
                        {problemCapture && (
                          <IconButton
                            aria-label="Hapus capture"
                            icon={<FiTrash2 />}
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => setProblemCapture(null)}
                          />
                        )}
                      </HStack>

                      {problemCapture ? (
                        <VStack spacing={2} align="start">
                          <HStack spacing={2}>
                            <Badge colorScheme="green" fontSize="xs">Terlampir</Badge>
                            <Text fontSize="xs" fontWeight="medium" noOfLines={1}>{problemCapture.name}</Text>
                          </HStack>
                          <Box maxH="140px" overflow="hidden" rounded="md" border="1px solid" borderColor={isDark ? "blue.800" : "blue.200"}>
                            <Image src={problemCapture.url} alt="Problem Preview" maxH="140px" objectFit="cover" />
                          </Box>
                        </VStack>
                      ) : (
                        <VStack py={3} spacing={2} align="center">
                          <Icon as={FiUploadCloud} boxSize={6} color="blue.400" />
                          <Text fontSize="xs" color="gray.500">Unggah screenshot error (.png, .jpg)</Text>
                          <Button
                            size="xs"
                            variant="outline"
                            colorScheme="blue"
                            onClick={() => handleSimulateUpload("problemCapture")}
                          >
                            Pilih Gambar
                          </Button>
                        </VStack>
                      )}
                    </Box>

                    {/* Logs (Text / Image) */}
                    <Box p={3.5} rounded="md" border="1px dashed" borderColor={isDark ? "purple.700" : "purple.200"} bg={isDark ? "purple.950" : "white"}>
                      <HStack justify="space-between" mb={2}>
                        <HStack spacing={1.5}>
                          <Icon as={FiFileText} color="purple.500" />
                          <Text fontSize="xs" fontWeight="bold">Logs (Teks Cuplikan / File)</Text>
                        </HStack>
                        {problemLogFile && (
                          <IconButton
                            aria-label="Hapus file log"
                            icon={<FiTrash2 />}
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => setProblemLogFile(null)}
                          />
                        )}
                      </HStack>

                      <Textarea
                        rows={2}
                        size="xs"
                        rounded="md"
                        fontFamily="mono"
                        placeholder="Tempel cuplikan stacktrace / log error di sini..."
                        value={problemLogText}
                        onChange={(e) => setProblemLogText(e.target.value)}
                        mb={2}
                      />

                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.500">
                          {problemLogFile ? `File: ${problemLogFile.name}` : "Atau unggah berkas log:"}
                        </Text>
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="purple"
                          onClick={() => handleSimulateUpload("problemLog")}
                        >
                          {problemLogFile ? "Ganti File Log" : "+ Lampirkan File Log"}
                        </Button>
                      </HStack>
                    </Box>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>

            {/* ════════════════════════════════════════════════════════════
                SECTION 4: SOLUTION DETAIL
                ════════════════════════════════════════════════════════════ */}
            <Card
              bg={isDark ? "secondary.900" : "white"}
              rounded={radiusStyle}
              shadow="sm"
              border="1px solid"
              borderColor={isDark ? "secondary.700" : "blue.100"}
            >
              <CardBody p={{ base: 4, md: 5 }}>
                <Flex justify="space-between" align="center" mb={hasSolution ? 4 : 0} wrap="wrap" gap={2}>
                  <HStack spacing={3} align="center">
                    <Icon as={FiCheckCircle} boxSize={5} color="green.500" />
                    <VStack align="start" spacing={0}>
                      <Heading size="sm">4. Solution Detail</Heading>
                      <Text fontSize="xs" color="gray.500">
                        Isi solusi jika kendala telah ditindaklanjuti atau telah berhasil diselesaikan.
                      </Text>
                    </VStack>
                  </HStack>

                  <Button
                    size="xs"
                    variant={hasSolution ? "ghost" : "outline"}
                    colorScheme={hasSolution ? "red" : "blue"}
                    leftIcon={hasSolution ? <FiX /> : <FiPlus />}
                    rounded="md"
                    onClick={() => {
                      setHasSolution(!hasSolution);
                      if (!hasSolution && statusIncident === "Open") {
                        setStatusIncident("In Progress");
                      }
                    }}
                  >
                    {hasSolution ? "Batal" : "Tambah solusi"}
                  </Button>
                </Flex>

                {hasSolution ? (
                  <VStack spacing={4} align="stretch">
                    {/* Jenis Solution & Tindak Lanjut */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Jenis Solution</FormLabel>
                        <RadioGroup
                          value={jenisSolution}
                          onChange={(val) => setJenisSolution(val as SolutionType)}
                        >
                          <HStack spacing={6} pt={1}>
                            <Radio value="Temporary" colorScheme="purple">
                              Temporary (Solusi Sementara)
                            </Radio>
                            <Radio value="Permanent" colorScheme="green">
                              Permanent (Solusi Permanen)
                            </Radio>
                          </HStack>
                        </RadioGroup>
                      </FormControl>

                      {/* Tindaklanjut jika Temporary */}
                      {jenisSolution === "Temporary" ? (
                        <FormControl isRequired>
                          <HStack justify="space-between" mb={1}>
                            <FormLabel fontSize="xs" fontWeight="bold" mb={0}>
                              Tindak Lanjut Solusi Permanen
                            </FormLabel>
                            <Badge colorScheme="purple" fontSize="xs">Wajib untuk Temporary</Badge>
                          </HStack>
                          <Textarea
                            rows={2}
                            size="sm"
                            rounded="md"
                            placeholder="Contoh: Rencana bugfix sprint depan, patching host, evaluasi kabel FO..."
                            value={tindakLanjut}
                            onChange={(e) => setTindakLanjut(e.target.value)}
                          />
                        </FormControl>
                      ) : (
                        <Box p={3} rounded="md" bg={isDark ? "green.950" : "green.50"} border="1px solid" borderColor={isDark ? "green.700" : "green.200"}>
                          <Text fontSize="xs" color="green.700" fontWeight="semibold">
                            Solusi permanen menyelesaikan akar permasalahan secara tuntas (root cause resolved).
                          </Text>
                        </Box>
                      )}
                    </SimpleGrid>

                    {/* Solved Date Range & Runtime */}
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">Solved Date (Mulai Pengerjaan)</FormLabel>
                        <Input
                          size="sm"
                          rounded="md"
                          type="datetime-local"
                          value={solvedDateStart}
                          onChange={(e) => setSolvedDateStart(e.target.value)}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">Solved Date (Selesai)</FormLabel>
                        <Input
                          size="sm"
                          rounded="md"
                          type="datetime-local"
                          value={solvedDateEnd}
                          onChange={(e) => setSolvedDateEnd(e.target.value)}
                        />
                      </FormControl>

                      {/* Runtime Solved */}
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">Runtime Penyelesaian</FormLabel>
                        <HStack spacing={2} pt={0.5}>
                          <HStack spacing={1}>
                            <Input
                              size="xs"
                              w="55px"
                              type="number"
                              min={0}
                              value={solutionRuntimeHours}
                              onChange={(e) => setSolutionRuntimeHours(parseInt(e.target.value) || 0)}
                            />
                            <Text fontSize="xs">Jam</Text>
                          </HStack>
                          <HStack spacing={1}>
                            <Input
                              size="xs"
                              w="55px"
                              type="number"
                              min={0}
                              max={59}
                              value={solutionRuntimeMinutes}
                              onChange={(e) => setSolutionRuntimeMinutes(parseInt(e.target.value) || 0)}
                            />
                            <Text fontSize="xs">Menit</Text>
                          </HStack>
                        </HStack>
                      </FormControl>
                    </SimpleGrid>

                    {/* Solved By & Grup */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">Solved By (Petugas Penyelesai)</FormLabel>
                        <Input
                          size="sm"
                          rounded="md"
                          placeholder="Nama engineer yang menyelesaikan..."
                          value={solvedBy}
                          onChange={(e) => setSolvedBy(e.target.value)}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">Grup Penyelesai</FormLabel>
                        <Input
                          size="sm"
                          rounded="md"
                          placeholder="Contoh: Group EoS Core Banking / Network"
                          value={solutionGrup}
                          onChange={(e) => setSolutionGrup(e.target.value)}
                        />
                      </FormControl>
                    </SimpleGrid>

                    {/* Solution Description */}
                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="bold">Solution Description</FormLabel>
                      <Textarea
                        rows={3}
                        size="sm"
                        rounded="md"
                        placeholder="Deskripsikan langkah-langkah teknis penanganan (misal: restart daemon, kill session, failover switch)..."
                        value={solutionDescription}
                        onChange={(e) => setSolutionDescription(e.target.value)}
                      />
                    </FormControl>

                    {/* Solutions Capture & Logs */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {/* Solutions Capture */}
                      <Box p={3.5} rounded="md" border="1px dashed" borderColor={isDark ? "green.700" : "green.200"} bg={isDark ? "green.950" : "white"}>
                        <HStack justify="space-between" mb={2}>
                          <HStack spacing={1.5}>
                            <Icon as={FiImage} color="green.500" />
                            <Text fontSize="xs" fontWeight="bold">Solutions Capture (Bukti Normal)</Text>
                          </HStack>
                          {solutionCapture && (
                            <IconButton
                              aria-label="Hapus capture"
                              icon={<FiTrash2 />}
                              size="xs"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => setSolutionCapture(null)}
                            />
                          )}
                        </HStack>

                        {solutionCapture ? (
                          <VStack spacing={2} align="start">
                            <HStack spacing={2}>
                              <Badge colorScheme="green" fontSize="xs">Terlampir</Badge>
                              <Text fontSize="xs" fontWeight="medium" noOfLines={1}>{solutionCapture.name}</Text>
                            </HStack>
                            <Box maxH="140px" overflow="hidden" rounded="md" border="1px solid" borderColor={isDark ? "green.700" : "green.200"}>
                              <Image src={solutionCapture.url} alt="Solution Preview" maxH="140px" objectFit="cover" />
                            </Box>
                          </VStack>
                        ) : (
                          <VStack py={3} spacing={2} align="center">
                            <Icon as={FiUploadCloud} boxSize={6} color="green.400" />
                            <Text fontSize="xs" color="gray.500">Unggah bukti screenshot layanan normal</Text>
                            <Button
                              size="xs"
                              variant="outline"
                              colorScheme="green"
                              onClick={() => handleSimulateUpload("solutionCapture")}
                            >
                              Pilih Gambar
                            </Button>
                          </VStack>
                        )}
                      </Box>

                      {/* Solution Logs */}
                      <Box p={3.5} rounded="md" border="1px dashed" borderColor={isDark ? "blue.700" : "blue.200"} bg={isDark ? "blue.950" : "white"}>
                        <HStack justify="space-between" mb={2}>
                          <HStack spacing={1.5}>
                            <Icon as={FiFileText} color="blue.500" />
                            <Text fontSize="xs" fontWeight="bold">Solution Logs (Hasil Verifikasi)</Text>
                          </HStack>
                          {solutionLogFile && (
                            <IconButton
                              aria-label="Hapus file log"
                              icon={<FiTrash2 />}
                              size="xs"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => setSolutionLogFile(null)}
                            />
                          )}
                        </HStack>

                        <Textarea
                          rows={2}
                          size="xs"
                          rounded="md"
                          fontFamily="mono"
                          placeholder="Hasil response log 200 OK / service status..."
                          value={solutionLogText}
                          onChange={(e) => setSolutionLogText(e.target.value)}
                          mb={2}
                        />

                        <HStack justify="space-between">
                          <Text fontSize="xs" color="gray.500">
                            {solutionLogFile ? `File: ${solutionLogFile.name}` : "Atau unggah berkas log:"}
                          </Text>
                          <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => handleSimulateUpload("solutionLog")}
                          >
                            {solutionLogFile ? "Ganti File Log" : "+ Lampirkan File Log"}
                          </Button>
                        </HStack>
                      </Box>
                    </SimpleGrid>
                  </VStack>
                ) : null}
              </CardBody>
            </Card>

            {/* ════════════════════════════════════════════════════════════
                SECTION 5: STATUS INCIDENT & REMARK
                ════════════════════════════════════════════════════════════ */}
            <Card
              bg={isDark ? "secondary.900" : "white"}
              rounded={radiusStyle}
              shadow="sm"
              border="1px solid"
              borderColor={isDark ? "secondary.700" : "blue.100"}
            >
              <CardBody p={{ base: 4, md: 5 }}>
                <HStack spacing={3} mb={4} align="center">
                  <Icon as={FiInfo} boxSize={5} color="purple.500" />
                  <VStack align="start" spacing={0}>
                    <Heading size="sm">5. Status Incident &amp; Remark</Heading>
                    <Text fontSize="xs" color="gray.500">
                      Tentukan status akhir penanganan incident dan catatan tambahan yang perlu diperhatikan.
                    </Text>
                  </VStack>
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                  {/* Status Incident */}
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold">Status Incident</FormLabel>
                    <RadioGroup
                      value={statusIncident}
                      onChange={(val) => {
                        const nextStatus = val as IncidentStatus;
                        setStatusIncident(nextStatus);
                        if (nextStatus === "Temporary Solved" || nextStatus === "Solved") {
                          setHasSolution(true);
                        }
                      }}
                    >
                      <VStack align="start" spacing={2} pt={1}>
                        <Radio value="Open" colorScheme="red">
                          <HStack spacing={2}>
                            <Badge colorScheme="red" fontSize="xs">Open</Badge>
                            <Text fontSize="xs">Incident baru dilaporkan, belum ada penanganan</Text>
                          </HStack>
                        </Radio>
                        <Radio value="In Progress" colorScheme="blue">
                          <HStack spacing={2}>
                            <Badge colorScheme="blue" fontSize="xs">In Progress</Badge>
                            <Text fontSize="xs">Sedang diteliti dan ditangani oleh engineer EoS</Text>
                          </HStack>
                        </Radio>
                        <Radio value="Pending" colorScheme="yellow">
                          <HStack spacing={2}>
                            <Badge colorScheme="yellow" fontSize="xs">Pending</Badge>
                            <Text fontSize="xs">Menunggu eskalasi vendor / pihak ketiga</Text>
                          </HStack>
                        </Radio>
                        <Radio value="Temporary Solved" colorScheme="purple">
                          <HStack spacing={2}>
                            <Badge colorScheme="purple" fontSize="xs">Temporary Solved</Badge>
                            <Text fontSize="xs">Layanan pulih sementara dengan solusi workaround</Text>
                          </HStack>
                        </Radio>
                        <Radio value="Solved" colorScheme="green">
                          <HStack spacing={2}>
                            <Badge colorScheme="green" fontSize="xs">Solved</Badge>
                            <Text fontSize="xs">Akar masalah selesai permanen</Text>
                          </HStack>
                        </Radio>
                      </VStack>
                    </RadioGroup>
                  </FormControl>

                  {/* Remark */}
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold">Remark / Catatan Tambahan</FormLabel>
                    <Textarea
                      rows={5}
                      size="sm"
                      rounded="md"
                      placeholder="Catatan khusus koordinasi, jadwal maintenance window, PIC pendamping, atau follow-up vendor..."
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                    />
                  </FormControl>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Bottom Actions */}
            <Flex justify="flex-end" gap={3} pt={2} pb={6}>
              <Button
                size="md"
                variant="outline"
                px={6}
                onClick={() => router.push(`/workspace/eos?appId=${selectedAppId}`)}
              >
                Batal
              </Button>
              <Button
                size="md"
                colorScheme="blue"
                px={8}
                leftIcon={<FiSave />}
                isLoading={isSubmitting}
                loadingText="Menyimpan..."
                type="submit"
              >
                Simpan Incident EoS
              </Button>
            </Flex>
          </VStack>
        </form>
      </Box>
    </LayoutAdmin>
  );
}
