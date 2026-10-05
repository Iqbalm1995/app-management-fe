"use client";

import React, { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  SimpleGrid,
  Spacer,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Text,
  Tooltip,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCpu,
  FiFileText,
  FiImage,
  FiLayers,
  FiMail,
  FiPhone,
  FiPlus,
  FiShield,
  FiUser,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent, HeaderContentProps } from "@/app/components/headerContent";
import { useDocumentTitle } from "@/app/hooks/useDocumentTitle";
import { radiusStyle } from "@/app/constants/applicationConstants";
import {
  EosIncidentItem,
  INITIAL_INCIDENTS_DATA,
  STATUS_INCIDENT_CONFIG,
} from "../types";

export default function EosDetailView() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();

  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Find incident or default to first
  const incident: EosIncidentItem = useMemo(() => {
    const found = INITIAL_INCIDENTS_DATA.find((i) => i.id === id);
    return found || INITIAL_INCIDENTS_DATA[0];
  }, [id]);

  useDocumentTitle(`${incident.incidentNumber} — Detail Incident EoS`);

  const statusCfg = STATUS_INCIDENT_CONFIG[incident.statusIncident];

  const HeaderDataContent: HeaderContentProps = {
    titleName: `Detail Incident ${incident.incidentNumber}`,
    breadCrumb: ["Home", "Workspace", "EOS", "Detail Incident"],
  };

  return (
    <LayoutAdmin>
      <Box p={{ base: 3, md: 5 }}>
        <HeaderContent {...HeaderDataContent} />

        {/* ════════════════════════════════════════════════════════════
            BLUE HEADER HERO SECTION (MATCHING APP STYLE)
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
                    onClick={() => router.push(`/workspace/eos?appId=${incident.appId}`)}
                    transition="all 0.2s ease"
                  />
                </Tooltip>

                <VStack align="start" spacing={1}>
                  <HStack spacing={2} wrap="wrap">
                    <Heading size="md" color="white" fontWeight="800">
                      {incident.incidentNumber}
                    </Heading>
                    <Badge bg="white" color="blue.800" fontSize="xs" px={2.5} py={0.5} rounded="md" fontWeight="bold">
                      {incident.appName} ({incident.appCode})
                    </Badge>
                    <Badge bg="whiteAlpha.300" color="white" fontSize="xs" px={2.5} py={0.5} rounded="md">
                      {incident.appTier}
                    </Badge>
                    {incident.priorityIncident && (
                      <Badge
                        colorScheme={
                          incident.priorityIncident === "HIGH"
                            ? "red"
                            : incident.priorityIncident === "MEDIUM"
                            ? "orange"
                            : "green"
                        }
                        fontSize="xs"
                        px={2.5}
                        py={0.5}
                        rounded="md"
                        fontWeight="extrabold"
                      >
                        Priority: {incident.priorityIncident}
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="xs" color="whiteAlpha.900">
                    Laporan Kendala Sistem &amp; Dokumentasi Penanganan Engineer on Support (EOS).
                  </Text>
                </VStack>
              </HStack>

              <HStack spacing={2.5}>
                <Badge
                  colorScheme={statusCfg.colorScheme}
                  px={3}
                  py={1}
                  rounded="full"
                  fontSize="xs"
                  fontWeight="bold"
                >
                  Status: {statusCfg.label}
                </Badge>
                <Button
                  size="sm"
                  bg="white"
                  color="blue.800"
                  _hover={{ bg: "gray.100" }}
                  leftIcon={<FiPlus />}
                  fontWeight="bold"
                  shadow="sm"
                  onClick={() => router.push(`/workspace/eos/create?appId=${incident.appId}`)}
                >
                  Buat Incident Baru
                </Button>
              </HStack>
            </Flex>

            <Divider borderColor="whiteAlpha.300" />

            {/* Quick Context Bar inside Blue Header */}
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={3}>
              <Box p={2.5} rounded="lg" bg="whiteAlpha.200" backdropFilter="blur(8px)" border="1px solid" borderColor="whiteAlpha.300">
                <Text fontSize="xs" color="whiteAlpha.800">Waktu Lapor:</Text>
                <Text fontSize="xs" fontWeight="bold" color="white">{incident.problem.reportDate.replace("T", " ")}</Text>
              </Box>

              <Box p={2.5} rounded="lg" bg="whiteAlpha.200" backdropFilter="blur(8px)" border="1px solid" borderColor="whiteAlpha.300">
                <Text fontSize="xs" color="whiteAlpha.800">Error Code:</Text>
                <Text fontSize="xs" fontWeight="bold" color="white">{incident.problem.errorCode}</Text>
              </Box>

              <Box p={2.5} rounded="lg" bg="whiteAlpha.200" backdropFilter="blur(8px)" border="1px solid" borderColor="whiteAlpha.300">
                <Text fontSize="xs" color="whiteAlpha.800">Jenis Surrounding:</Text>
                <Text fontSize="xs" fontWeight="bold" color="white">{incident.problem.jenisSurrounding}</Text>
              </Box>

              <Box p={2.5} rounded="lg" bg="whiteAlpha.200" backdropFilter="blur(8px)" border="1px solid" borderColor="whiteAlpha.300">
                <Text fontSize="xs" color="whiteAlpha.800">Runtime Durasi:</Text>
                <Text fontSize="xs" fontWeight="bold" color="white">{incident.problem.runtimeHours} Jam {incident.problem.runtimeMinutes} Menit</Text>
              </Box>
            </SimpleGrid>
          </VStack>
        </Box>

        {/* ════════════════════════════════════════════════════════════
            GRID SECTION: PIC PELAPOR & PIC EOS
            ════════════════════════════════════════════════════════════ */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
          {/* PIC Pelapor Card */}
          <Card bg={isDark ? "gray.800" : "white"} rounded={radiusStyle} shadow="sm" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
            <CardBody p={4}>
              <HStack spacing={2} mb={3}>
                <Icon as={FiUser} color="blue.500" />
                <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="blue.600">
                  PIC Pelapor
                </Heading>
              </HStack>

              <VStack align="stretch" spacing={2.5} fontSize="xs">
                <Flex justify="space-between">
                  <Text color="gray.500">Nama Lengkap:</Text>
                  <Text fontWeight="bold">{incident.picPelapor.namaLengkap}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.500">No. Telepon:</Text>
                  <HStack spacing={1}>
                    <Icon as={FiPhone} color="gray.400" />
                    <Text fontWeight="semibold">{incident.picPelapor.noTelp || "-"}</Text>
                  </HStack>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.500">Email:</Text>
                  <HStack spacing={1}>
                    <Icon as={FiMail} color="gray.400" />
                    <Text fontWeight="semibold">{incident.picPelapor.email || "-"}</Text>
                  </HStack>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.500">Divisi:</Text>
                  <Badge colorScheme="blue" variant="subtle" fontSize="xs">{incident.picPelapor.divisi}</Badge>
                </Flex>
              </VStack>
            </CardBody>
          </Card>

          {/* PIC EoS Card */}
          <Card bg={isDark ? "gray.800" : "white"} rounded={radiusStyle} shadow="sm" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
            <CardBody p={4}>
              <HStack spacing={2} mb={3}>
                <Icon as={FiZap} color="orange.500" />
                <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="orange.600">
                  PIC EoS (Engineer on Support)
                </Heading>
              </HStack>

              <VStack align="stretch" spacing={2.5} fontSize="xs">
                <Flex justify="space-between">
                  <Text color="gray.500">Nama Lengkap:</Text>
                  <Text fontWeight="bold">{incident.picEos.namaLengkap}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.500">No. Telepon:</Text>
                  <HStack spacing={1}>
                    <Icon as={FiPhone} color="gray.400" />
                    <Text fontWeight="semibold">{incident.picEos.noTelp || "-"}</Text>
                  </HStack>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.500">Email:</Text>
                  <HStack spacing={1}>
                    <Icon as={FiMail} color="gray.400" />
                    <Text fontWeight="semibold">{incident.picEos.email || "-"}</Text>
                  </HStack>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.500">Grup IT:</Text>
                  <Badge colorScheme="orange" variant="subtle" fontSize="xs">{incident.picEos.grup}</Badge>
                </Flex>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* ════════════════════════════════════════════════════════════
            TABS: PROBLEM DETAIL, SOLUTION DETAIL & REMARK
            ════════════════════════════════════════════════════════════ */}
        <Card bg={isDark ? "gray.800" : "white"} rounded={radiusStyle} shadow="sm" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
          <CardBody p={0}>
            <Tabs colorScheme="blue" isLazy>
              <TabList px={4} pt={2} borderBottom="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                <Tab fontWeight="bold" fontSize="xs">
                  <HStack spacing={1.5}>
                    <Icon as={FiAlertTriangle} color="red.500" />
                    <Text>Problem Detail</Text>
                  </HStack>
                </Tab>
                <Tab fontWeight="bold" fontSize="xs">
                  <HStack spacing={1.5}>
                    <Icon as={FiCheckCircle} color="green.500" />
                    <Text>Solution Detail</Text>
                    {incident.solution.jenisSolution && (
                      <Badge colorScheme={incident.solution.jenisSolution === "Permanent" ? "green" : "purple"} fontSize="xs">
                        {incident.solution.jenisSolution}
                      </Badge>
                    )}
                  </HStack>
                </Tab>
                <Tab fontWeight="bold" fontSize="xs">
                  <HStack spacing={1.5}>
                    <Icon as={FiFileText} />
                    <Text>Remark &amp; Catatan</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels p={4}>
                {/* ── TAB 1: PROBLEM DETAIL ── */}
                <TabPanel p={0}>
                  <VStack align="stretch" spacing={4}>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={3}>
                      <Box p={3} rounded="lg" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.750" : "gray.50"}>
                        <Text fontSize="xs" color="gray.500">Error Code</Text>
                        <Text fontSize="sm" fontWeight="extrabold" color="purple.600">{incident.problem.errorCode}</Text>
                      </Box>
                      <Box p={3} rounded="lg" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.750" : "gray.50"}>
                        <Text fontSize="xs" color="gray.500">Jenis Surrounding</Text>
                        <Text fontSize="sm" fontWeight="bold">{incident.problem.jenisSurrounding}</Text>
                      </Box>
                      <Box p={3} rounded="lg" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.750" : "gray.50"}>
                        <Text fontSize="xs" color="gray.500">Problem Kategori</Text>
                        <Badge colorScheme="red" fontSize="xs" mt={0.5}>{incident.problem.problemCategory}</Badge>
                      </Box>
                      <Box p={3} rounded="lg" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.750" : "gray.50"}>
                        <Text fontSize="xs" color="gray.500">Durasi Runtime Insiden</Text>
                        <Text fontSize="sm" fontWeight="bold" color="blue.600">
                          {incident.problem.runtimeHours} Jam {incident.problem.runtimeMinutes} Menit
                        </Text>
                      </Box>
                    </SimpleGrid>

                    {/* Error Description */}
                    <Box p={3.5} rounded="lg" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                      <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>
                        Error Description (Katalog Database IBC):
                      </Text>
                      <Text fontSize="sm" fontWeight="semibold" color={isDark ? "gray.200" : "gray.800"}>
                        {incident.problem.errorDescription}
                      </Text>
                    </Box>

                    {/* Problem Description (Kronologi) */}
                    <Box p={3.5} rounded="lg" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                      <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>
                        Problem Description (Kronologi Kejadian):
                      </Text>
                      <Text fontSize="sm" color={isDark ? "gray.300" : "gray.700"}>
                        {incident.problem.problemDescription}
                      </Text>
                    </Box>

                    {/* Attachments & Logs */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {/* Problem Capture Screenshot */}
                      <Box p={3.5} rounded="lg" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                        <HStack spacing={1.5} mb={2}>
                          <Icon as={FiImage} color="blue.500" />
                          <Text fontSize="xs" fontWeight="bold">Problem Capture (Screenshot Error)</Text>
                        </HStack>

                        {incident.problem.problemCaptureName ? (
                          <VStack align="start" spacing={2}>
                            <Badge colorScheme="green" fontSize="xs">
                              {incident.problem.problemCaptureName}
                            </Badge>
                            <Box rounded="md" overflow="hidden" border="1px solid" borderColor="gray.200">
                              <Image
                                src={incident.problem.problemCaptureUrl || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"}
                                alt="Capture Error"
                                maxH="180px"
                                objectFit="cover"
                              />
                            </Box>
                          </VStack>
                        ) : (
                          <Text fontSize="xs" color="gray.400" fontStyle="italic">Tidak ada tangkapan layar dilampirkan.</Text>
                        )}
                      </Box>

                      {/* Problem Logs */}
                      <Box p={3.5} rounded="lg" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                        <HStack spacing={1.5} mb={2}>
                          <Icon as={FiFileText} color="purple.500" />
                          <Text fontSize="xs" fontWeight="bold">Problem Logs &amp; Stacktrace</Text>
                        </HStack>

                        {incident.problem.logsText ? (
                          <Box
                            p={3}
                            rounded="md"
                            bg={isDark ? "gray.900" : "gray.900"}
                            color="green.300"
                            fontSize="xs"
                            fontFamily="mono"
                            whiteSpace="pre-wrap"
                            maxH="180px"
                            overflowY="auto"
                          >
                            {incident.problem.logsText}
                          </Box>
                        ) : (
                          <Text fontSize="xs" color="gray.400" fontStyle="italic">Tidak ada teks log dilampirkan.</Text>
                        )}
                      </Box>
                    </SimpleGrid>
                  </VStack>
                </TabPanel>

                {/* ── TAB 2: SOLUTION DETAIL ── */}
                <TabPanel p={0}>
                  <VStack align="stretch" spacing={4}>
                    {incident.solution.jenisSolution ? (
                      <>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                          <Box p={3} rounded="lg" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.750" : "gray.50"}>
                            <Text fontSize="xs" color="gray.500">Jenis Solution</Text>
                            <Badge
                              colorScheme={incident.solution.jenisSolution === "Permanent" ? "green" : "purple"}
                              fontSize="xs"
                              mt={0.5}
                            >
                              {incident.solution.jenisSolution}
                            </Badge>
                          </Box>

                          <Box p={3} rounded="lg" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.750" : "gray.50"}>
                            <Text fontSize="xs" color="gray.500">Solved By &amp; Grup</Text>
                            <Text fontSize="xs" fontWeight="bold">
                              {incident.solution.solvedBy || "-"}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {incident.solution.grup || incident.picEos.grup}
                            </Text>
                          </Box>

                          <Box p={3} rounded="lg" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.750" : "gray.50"}>
                            <Text fontSize="xs" color="gray.500">Solved Runtime</Text>
                            <Text fontSize="xs" fontWeight="bold" color="green.600">
                              {incident.solution.runtimeHours || 0} Jam {incident.solution.runtimeMinutes || 0} Menit
                            </Text>
                          </Box>
                        </SimpleGrid>

                        {/* Tindaklanjut if Temporary */}
                        {incident.solution.jenisSolution === "Temporary" && (
                          <Box p={3.5} rounded="lg" border="1px solid" borderColor="purple.300" bg={isDark ? "gray.750" : "purple.50"}>
                            <HStack spacing={2} mb={1}>
                              <Badge colorScheme="purple" fontSize="xs">Tindak Lanjut Solusi Permanen</Badge>
                            </HStack>
                            <Text fontSize="sm" color={isDark ? "gray.200" : "purple.900"}>
                              {incident.solution.tindakLanjut || "Belum ada rencana tindak lanjut tercatat."}
                            </Text>
                          </Box>
                        )}

                        {/* Solution Description */}
                        <Box p={3.5} rounded="lg" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                          <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>
                            Solution Description (Langkah Penanganan):
                          </Text>
                          <Text fontSize="sm" color={isDark ? "gray.300" : "gray.700"}>
                            {incident.solution.solutionDescription || "Belum ada rincian solusi."}
                          </Text>
                        </Box>

                        {/* Solution Capture & Logs */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <Box p={3.5} rounded="lg" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                            <HStack spacing={1.5} mb={2}>
                              <Icon as={FiImage} color="green.500" />
                              <Text fontSize="xs" fontWeight="bold">Solutions Capture (Bukti Normal)</Text>
                            </HStack>
                            {incident.solution.solutionCaptureName ? (
                              <VStack align="start" spacing={2}>
                                <Badge colorScheme="green" fontSize="xs">{incident.solution.solutionCaptureName}</Badge>
                                <Box rounded="md" overflow="hidden" border="1px solid" borderColor="gray.200">
                                  <Image
                                    src={incident.solution.solutionCaptureUrl || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"}
                                    alt="Capture Normal"
                                    maxH="160px"
                                    objectFit="cover"
                                  />
                                </Box>
                              </VStack>
                            ) : (
                              <Text fontSize="xs" color="gray.400" fontStyle="italic">Tidak ada bukti gambar solusi.</Text>
                            )}
                          </Box>

                          <Box p={3.5} rounded="lg" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                            <HStack spacing={1.5} mb={2}>
                              <Icon as={FiFileText} color="blue.500" />
                              <Text fontSize="xs" fontWeight="bold">Solution Logs (Verifikasi Berhasil)</Text>
                            </HStack>
                            {incident.solution.logsText ? (
                              <Box
                                p={3}
                                rounded="md"
                                bg={isDark ? "gray.900" : "gray.900"}
                                color="green.300"
                                fontSize="xs"
                                fontFamily="mono"
                                whiteSpace="pre-wrap"
                                maxH="160px"
                                overflowY="auto"
                              >
                                {incident.solution.logsText}
                              </Box>
                            ) : (
                              <Text fontSize="xs" color="gray.400" fontStyle="italic">Tidak ada log solusi dilampirkan.</Text>
                            )}
                          </Box>
                        </SimpleGrid>
                      </>
                    ) : (
                      <Alert status="warning" rounded="md">
                        <AlertIcon />
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" fontWeight="bold">Solusi Belum Dilaporkan</Text>
                          <Text fontSize="xs">
                            Incident ini masih berstatus <b>{incident.statusIncident}</b> dan belum memiliki rincian solusi penanganan.
                          </Text>
                        </VStack>
                      </Alert>
                    )}
                  </VStack>
                </TabPanel>

                {/* ── TAB 3: REMARK & CATATAN ── */}
                <TabPanel p={0}>
                  <VStack align="stretch" spacing={4}>
                    <Box p={4} rounded="lg" border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"}>
                      <Heading size="xs" textTransform="uppercase" color="blue.600" mb={2}>
                        Remark / Catatan Tambahan EoS:
                      </Heading>
                      <Text fontSize="sm" color={isDark ? "gray.200" : "gray.800"}>
                        {incident.remark || "Tidak ada catatan remark tambahan."}
                      </Text>
                    </Box>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} fontSize="xs" color="gray.500">
                      <HStack justify="space-between" p={3} rounded="md" bg={isDark ? "gray.750" : "gray.50"}>
                        <Text>Waktu Dibuat:</Text>
                        <Text fontWeight="semibold">{incident.createdAt}</Text>
                      </HStack>
                      <HStack justify="space-between" p={3} rounded="md" bg={isDark ? "gray.750" : "gray.50"}>
                        <Text>Terakhir Diperbarui:</Text>
                        <Text fontWeight="semibold">{incident.updatedAt}</Text>
                      </HStack>
                    </SimpleGrid>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </Box>
    </LayoutAdmin>
  );
}
