"use client";

import { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorMode,
  Icon,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
} from "@chakra-ui/react";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { FiCheckCircle, FiClock, FiEye, FiUser, FiLayers, FiArrowRight } from "react-icons/fi";

export default function KnowledgeBaseViewV2() {
  const { colorMode } = useColorMode();
  const [activeGuide, setActiveGuide] = useState<string>("requirement-flow");

  const guideItems = [
    { id: "requirement-flow", label: "Requirement Flow", icon: FiLayers },
    { id: "project-setup", label: "Project Register Flow", icon: FiUser, disabled: false },
    { id: "task-management", label: "Kanban Flow", icon: FiCheckCircle, disabled: true },
    // { id: "deployment", label: "Deployment Guide", icon: FiArrowRight, disabled: true },
  ];

  return (
    <LayoutAdmin>
      <Box p={6}>
        <Heading size="lg" mb={6}>
          BJB aPPs User Guide
        </Heading>

        <Flex gap={6} direction={{ base: "column", lg: "row" }}>
          {/* Left Side Navigation */}
          <Box w={{ base: "100%", lg: "240px" }} flexShrink={0}>
            <Card
              bg={colorMode === "light" ? "white" : "gray.800"}
              shadow="sm"
              position={{ base: "relative", lg: "sticky" }}
              top={{ base: "0", lg: "20px" }}
              borderRadius="xl"
              border="1px solid"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
            >
              <CardBody p={4}>
                <VStack spacing={2} align="stretch">
                  <HStack spacing={2}>

                    <Heading
                      size="sm"
                      color={colorMode === "light" ? "gray.800" : "white"}
                    >

                    </Heading>
                  </HStack>

                  <Divider />

                  <VStack spacing={2} align="stretch">
                    {guideItems.map((item) => (
                      <Button
                        key={item.id}
                        size="sm"
                        variant={activeGuide === item.id ? "solid" : "ghost"}
                        colorScheme={activeGuide === item.id ? "blue" : "gray"}
                        onClick={() => !item.disabled && setActiveGuide(item.id)}
                        justifyContent="flex-start"
                        leftIcon={<Icon as={item.icon} boxSize={3} />}
                        fontSize="xs"
                        h="32px"
                        isDisabled={item.disabled}
                        opacity={item.disabled ? 0.5 : 1}
                        cursor={item.disabled ? "not-allowed" : "pointer"}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </Box>

          {/* Main Content Area */}
          <Flex flex={1} direction="column">
            {activeGuide === "requirement-flow" && <RequirementFlowContent colorMode={colorMode} />}
          </Flex>
        </Flex>
      </Box>
    </LayoutAdmin>
  );
}

// Requirement Flow Content
function RequirementFlowContent({ colorMode }: { colorMode: string }) {
  return (
    <Flex direction="column" gap={6} w="full">
      {/* Navigation Panel */}
      <Card
        bg={colorMode === "light" ? "white" : "gray.800"}
        shadow="md"
        borderRadius="lg"
      >
        <CardBody p={6}>
          <VStack spacing={4} align="stretch">
            <Box>
              <HStack spacing={3} mb={2}>
                <Icon as={FiLayers} boxSize={5} color="blue.500" />
                <Heading size="md" color={colorMode === "light" ? "gray.800" : "white"}>
                  Requirements Flow
                </Heading>
              </HStack>
              <Divider />
            </Box>

            <Box
              p={4}
              bg={colorMode === "light" ? "blue.50" : "blue.900"}
              borderRadius="md"
              borderLeft="4px solid"
              borderColor="blue.500"
            >
              <Text fontSize="sm" fontWeight="medium" color={colorMode === "light" ? "blue.800" : "blue.100"}>
                Flow Kerja BRD / RFC
              </Text>
              <Text fontSize="xs" mt={1} color={colorMode === "light" ? "blue.600" : "blue.200"}>
                Dokumentasi proses end-to-end
              </Text>
            </Box>

            <Divider />

            <HStack spacing={4} flexWrap="wrap">
              <HStack spacing={2}>
                <Icon as={FiEye} boxSize={4} color="gray.500" />
                <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.300"}>Overview</Text>
              </HStack>
              <HStack spacing={2}>
                <Icon as={FiUser} boxSize={4} color="green.500" />
                <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.300"}>Flow MAKER</Text>
              </HStack>
              <HStack spacing={2}>
                <Icon as={FiCheckCircle} boxSize={4} color="purple.500" />
                <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.300"}>Flow APPROVER</Text>
              </HStack>
              <HStack spacing={2}>
                <Icon as={FiClock} boxSize={4} color="orange.500" />
                <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.300"}>Status & Aturan</Text>
              </HStack>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Tabs Content */}
      <Card
        bg={colorMode === "light" ? "white" : "gray.800"}
        shadow="md"
        borderRadius="lg"
        w="full"
      >
        <CardBody p={6}>
          <Tabs variant="unstyled" colorScheme="blue">
            <TabList
              gap={2}
              mb={6}
              p={2}
              bg={colorMode === "light" ? "gray.50" : "gray.900"}
              borderRadius="xl"
              flexWrap="wrap"
            >
              <Tab
                flex={1}
                minW="fit-content"
                px={5}
                py={3}
                borderRadius="lg"
                fontWeight="semibold"
                fontSize="sm"
                color={colorMode === "light" ? "gray.600" : "gray.400"}
                position="relative"
                _selected={{
                  color: colorMode === "light" ? "blue.600" : "blue.300",
                  bg: colorMode === "light" ? "white" : "gray.800",
                  transform: "translateY(-2px)",
                  shadow: "sm",
                  _after: {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "60%",
                    height: "3px",
                    bg: colorMode === "light" ? "blue.500" : "blue.400",
                    borderRadius: "full",
                  },
                }}
                _hover={{
                  transform: "translateY(-2px)",
                  shadow: "sm",
                  color: colorMode === "light" ? "blue.500" : "blue.300",
                  bg: colorMode === "light" ? "white" : "gray.800",
                }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                <HStack spacing={2} justify="center">
                  <Icon as={FiEye} boxSize={4} />
                  <Text>Overview</Text>
                </HStack>
              </Tab>
              <Tab
                flex={1}
                minW="fit-content"
                px={5}
                py={3}
                borderRadius="lg"
                fontWeight="semibold"
                fontSize="sm"
                color={colorMode === "light" ? "gray.600" : "gray.400"}
                position="relative"
                _selected={{
                  color: colorMode === "light" ? "blue.600" : "blue.300",
                  bg: colorMode === "light" ? "white" : "gray.800",
                  transform: "translateY(-2px)",
                  shadow: "sm",
                  _after: {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "60%",
                    height: "3px",
                    bg: colorMode === "light" ? "blue.500" : "blue.400",
                    borderRadius: "full",
                  },
                }}
                _hover={{
                  transform: "translateY(-2px)",
                  shadow: "sm",
                  color: colorMode === "light" ? "blue.500" : "blue.300",
                  bg: colorMode === "light" ? "white" : "gray.800",
                }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                <HStack spacing={2} justify="center">
                  <Icon as={FiUser} boxSize={4} />
                  <Text>Flow MAKER</Text>
                </HStack>
              </Tab>
              <Tab
                flex={1}
                minW="fit-content"
                px={5}
                py={3}
                borderRadius="lg"
                fontWeight="semibold"
                fontSize="sm"
                color={colorMode === "light" ? "gray.600" : "gray.400"}
                position="relative"
                _selected={{
                  color: colorMode === "light" ? "blue.600" : "blue.300",
                  bg: colorMode === "light" ? "white" : "gray.800",
                  transform: "translateY(-2px)",
                  shadow: "sm",
                  _after: {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "60%",
                    height: "3px",
                    bg: colorMode === "light" ? "blue.500" : "blue.400",
                    borderRadius: "full",
                  },
                }}
                _hover={{
                  transform: "translateY(-2px)",
                  shadow: "sm",
                  color: colorMode === "light" ? "blue.500" : "blue.300",
                  bg: colorMode === "light" ? "white" : "gray.800",
                }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                <HStack spacing={2} justify="center">
                  <Icon as={FiCheckCircle} boxSize={4} />
                  <Text>Flow APPROVER</Text>
                </HStack>
              </Tab>
              <Tab
                flex={1}
                minW="fit-content"
                px={5}
                py={3}
                borderRadius="lg"
                fontWeight="semibold"
                fontSize="sm"
                color={colorMode === "light" ? "gray.600" : "gray.400"}
                position="relative"
                _selected={{
                  color: colorMode === "light" ? "blue.600" : "blue.300",
                  bg: colorMode === "light" ? "white" : "gray.800",
                  transform: "translateY(-2px)",
                  shadow: "sm",
                  _after: {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "60%",
                    height: "3px",
                    bg: colorMode === "light" ? "blue.500" : "blue.400",
                    borderRadius: "full",
                  },
                }}
                _hover={{
                  transform: "translateY(-2px)",
                  shadow: "sm",
                  color: colorMode === "light" ? "blue.500" : "blue.300",
                  bg: colorMode === "light" ? "white" : "gray.800",
                }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                <HStack spacing={2} justify="center">
                  <Icon as={FiClock} boxSize={4} />
                  <Text>Status & Aturan</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0} py={6}>
                <Box
                  w="full"
                  animation="fadeIn 0.4s ease-in-out"
                  sx={{
                    "@keyframes fadeIn": {
                      "0%": { opacity: 0, transform: "translateY(10px)" },
                      "100%": { opacity: 1, transform: "translateY(0)" },
                    },
                  }}
                >
                  <OverviewContent colorMode={colorMode} />
                </Box>
              </TabPanel>
              <TabPanel px={0} py={6}>
                <Box
                  w="full"
                  animation="fadeIn 0.4s ease-in-out"
                  sx={{
                    "@keyframes fadeIn": {
                      "0%": { opacity: 0, transform: "translateY(10px)" },
                      "100%": { opacity: 1, transform: "translateY(0)" },
                    },
                  }}
                >
                  <MakerFlowContent colorMode={colorMode} />
                </Box>
              </TabPanel>
              <TabPanel px={0} py={6}>
                <Box
                  w="full"
                  animation="fadeIn 0.4s ease-in-out"
                  sx={{
                    "@keyframes fadeIn": {
                      "0%": { opacity: 0, transform: "translateY(10px)" },
                      "100%": { opacity: 1, transform: "translateY(0)" },
                    },
                  }}
                >
                  <ApprovalFlowContent colorMode={colorMode} />
                </Box>
              </TabPanel>
              <TabPanel px={0} py={6}>
                <Box
                  w="full"
                  animation="fadeIn 0.4s ease-in-out"
                  sx={{
                    "@keyframes fadeIn": {
                      "0%": { opacity: 0, transform: "translateY(10px)" },
                      "100%": { opacity: 1, transform: "translateY(0)" },
                    },
                  }}
                >
                  <StatusAndRulesContent colorMode={colorMode} />
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </Flex>
  );
}

// Overview Content
function OverviewContent({ colorMode }: { colorMode: string }) {
  return (
    <VStack spacing={6} align="stretch" w="full">
      <Box>
        <Heading size="lg" mb={4}>
          Overview Flow Kerja BRD / RFC
        </Heading>
        <Text fontSize="md" color={colorMode === "light" ? "gray.600" : "gray.300"} mb={4}>
          Proses BRD (Business Requirements Document) dan RFC (Request for Change) mengikuti Flow kerja terstruktur berbasis Role yang dirancang untuk memastikan kualitas dan akuntabilitas di setiap tahap.
        </Text>
      </Box>

      <Card bg={colorMode === "light" ? "blue.50" : "blue.900"} borderLeft="4px solid" borderColor="blue.500">
        <CardBody>
          <Heading size="sm" mb={2}>
            Prinsip Utama
          </Heading>
          <VStack spacing={2} align="stretch">
            <HStack>
              <Icon as={FiCheckCircle} color="blue.500" />
              <Text>Flow kerja berbasis Role dengan tanggung jawab yang jelas</Text>
            </HStack>
            <HStack>
              <Icon as={FiCheckCircle} color="blue.500" />
              <Text>Proses berurutan mencegah tahapan yang terlewat</Text>
            </HStack>
            <HStack>
              <Icon as={FiCheckCircle} color="blue.500" />
              <Text>Visibilitas Button berdasarkan status untuk memastikan Flow yang tepat</Text>
            </HStack>
            <HStack>
              <Icon as={FiCheckCircle} color="blue.500" />
              <Text>Pelacakan otomatis terhadap timeline review</Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      <Box>
        <Heading size="md" mb={3}>
          Role dalam Flow Kerja
        </Heading>
        <VStack spacing={3} align="stretch">
          <Card bg={colorMode === "light" ? "green.50" : "green.900"}>
            <CardBody>
              <HStack mb={2}>
                <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                  MAKER
                </Badge>
              </HStack>
              <Text>
                Bertanggung jawab untuk menerima BRD/RFC, menginput Requirement, memulai review, dan mengirimkan pekerjaan yang telah selesai untuk disetujui (Level Jabatan Officer - Manager)
              </Text>
            </CardBody>
          </Card>

          <Card bg={colorMode === "light" ? "purple.50" : "purple.900"}>
            <CardBody>
              <HStack mb={2}>
                <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                  APPROVER
                </Badge>
              </HStack>
              <Text>
                Bertanggung jawab untuk meninjau Requirement yang telah dikirim, memberikan feedback, dan menyetujui atau menolak pekerjaan. (Level Jabatan Grup Head)
              </Text>
            </CardBody>
          </Card>
        </VStack>
      </Box>

      <Box>
        <Heading size="md" mb={3}>
          Flow Proses
        </Heading>
        <Text mb={3}>
          Flow kerja berjalan secara berurutan dari MAKER ke APPROVER:
        </Text>
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={4}
          align="center"
          justify="center"
        >
          <Card flex={1} bg={colorMode === "light" ? "green.50" : "green.900"} textAlign="center">
            <CardBody>
              <Badge colorScheme="green" mb={2}>MAKER</Badge>
              <Text fontSize="sm">Input & Review</Text>
            </CardBody>
          </Card>
          <Icon as={FiArrowRight} boxSize={6} color="blue.500" />
          <Card flex={1} bg={colorMode === "light" ? "purple.50" : "purple.900"} textAlign="center">
            <CardBody>
              <Badge colorScheme="purple" mb={2}>APPROVER</Badge>
              <Text fontSize="sm">Review & Persetujuan</Text>
            </CardBody>
          </Card>
        </Flex>
      </Box>
    </VStack>
  );
}

// MAKER Flow Content
function MakerFlowContent({ colorMode }: { colorMode: string }) {
  const steps = [
    {
      title: "Menerima BRD/RFC",
      description: "BRD atau RFC baru ditugaskan kepada Anda. Requirement muncul dalam daftar Requirement Anda dengan status \"Baru\" atau \"Pending\".",
    },
    {
      title: "Input Requirement",
      description: "Buka Requirement dan isi semua detail yang diperlukan, termasuk deskripsi, kriteria penerimaan, dan lampiran.",
    },
    {
      title: "Lihat dalam Tabel Requirement",
      description: "Requirement ditampilkan dalam tabel dengan aksi: Preview (lihat detail Requirement, selalu tersedia) dan START REVIEW(memulai proses review).",
    },
    {
      title: "Mulai Review",
      description: "Ketika Anda klik \"Mulai Review\": Counting hari review dimulai secara otomatis dan status Requirement berubah menjadi \"Dalam Proses\" atau \"Sedang Review\".",
    },
    {
      title: "Selesaikan dan Kirim Review",
      description: "Setelah menyelesaikan review Anda, kirim Requirement untuk disetujui. Ini memindahkan Flow kerja ke Role APPROVER.",
    },
    {
      title: "Status Setelah Pengiriman",
      description: "Setelah pengiriman: Button \"Mulai Review\" tidak lagi tersedia (Nonaktif), sedangkan Button \"Preview\" tetap tersedia untuk melihat (Aktif).",
    },
  ];

  return (
    <VStack spacing={6} align="stretch" w="full">
      <Box>
        <HStack mb={4}>
          <Badge colorScheme="green" fontSize="lg" px={4} py={2}>
            MAKER
          </Badge>
          <Heading size="lg"></Heading>
        </HStack>
        <Text fontSize="md" color={colorMode === "light" ? "gray.600" : "gray.300"}>
          Flow User Maker
        </Text>
      </Box>

      <VStack spacing={8} align="stretch" w="full">
        {steps.map((step, index) => (
          <HStack key={index} align="flex-start" spacing={4} w="full" position="relative">
            {index < steps.length - 1 && (
              <Box
                position="absolute"
                left="19px"
                top="40px"
                bottom="-32px"
                width="2px"
                bg="green.500"
                zIndex={0}
              />
            )}
            <Box
              minW="40px"
              h="40px"
              borderRadius="full"
              borderWidth="2px"
              borderColor="green.500"
              bg={colorMode === "light" ? "white" : "gray.800"}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="bold"
              color="green.500"
              flexShrink={0}
              position="relative"
              zIndex={1}
            >
              {index + 1}
            </Box>
            <Box flex={1}>
              <Text fontWeight="bold" fontSize="md" mb={2}>
                {step.title}
              </Text>
              <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                {step.description}
              </Text>
            </Box>
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
}

// APPROVER Flow Content
function ApprovalFlowContent({ colorMode }: { colorMode: string }) {
  const steps = [
    {
      title: "Menerima BRD/RFC",
      description: "BRD atau RFC dikirim oleh MAKER dan muncul dalam antrian persetujuan Anda. Anda menerima notifikasi bahwa Requirement siap untuk ditinjau.",
    },
    {
      title: "Lihat Daftar Requirement",
      description: "Requirement yang menunggu persetujuan ditampilkan dalam tabel. Anda dapat melihat status dan aksi yang tersedia untuk setiap Requirement.",
    },
    {
      title: "Preview Sebelum Pengiriman",
      description: "Saat MAKER belum mengirim review: Button \"Preview\" terlihat dan Anda dapat melihat Requirement tetapi belum dapat mengambil tindakan.",
    },
    {
      title: "Tinjau Requirement yang Dikirim",
      description: "Setelah MAKER mengirim review: Status Requirement berubah menjadi \"Dikirim\" atau \"Menunggu Persetujuan\" dan Anda sekarang dapat meninjau detail Requirement secara lengkap.",
    },
    {
      title: "Setujui atau Tolak",
      description: "Berdasarkan tinjauan Anda, Anda dapat: Setujui (terima Requirement dan pindahkan ke tahap berikutnya) atau Tolak (kirim kembali ke MAKER dengan feedback untuk revisi).",
    },
    {
      title: "Berikan Feedback",
      description: "Jika menolak, berikan feedback yang jelas menjelaskan apa yang perlu diubah. Requirement kembali ke MAKER untuk revisi.",
    },
  ];

  return (
    <VStack spacing={6} align="stretch" w="full">
      <Box>
        <HStack mb={4}>
          <Badge colorScheme="purple" fontSize="lg" px={4} py={2}>
            APPROVER
          </Badge>
          <Heading size="lg"></Heading>
        </HStack>
        <Text fontSize="md" color={colorMode === "light" ? "gray.600" : "gray.300"}>
          Flow User APPROVER
        </Text>
      </Box>

      <VStack spacing={8} align="stretch" w="full">
        {steps.map((step, index) => (
          <HStack key={index} align="flex-start" spacing={4} w="full" position="relative">
            {index < steps.length - 1 && (
              <Box
                position="absolute"
                left="19px"
                top="40px"
                bottom="-32px"
                width="2px"
                bg="purple.500"
                zIndex={0}
              />
            )}
            <Box
              minW="40px"
              h="40px"
              borderRadius="full"
              borderWidth="2px"
              borderColor="purple.500"
              bg={colorMode === "light" ? "white" : "gray.800"}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="bold"
              color="purple.500"
              flexShrink={0}
              position="relative"
              zIndex={1}
            >
              {index + 1}
            </Box>
            <Box flex={1}>
              <Text fontWeight="bold" fontSize="md" mb={2}>
                {step.title}
              </Text>
              <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                {step.description}
              </Text>
            </Box>
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
}

// Status and Rules Content
function StatusAndRulesContent({ colorMode }: { colorMode: string }) {
  return (
    <VStack spacing={6} align="stretch" w="full">
      <Box>
        <Heading size="lg" mb={4}>
          Status
        </Heading>
        <Text fontSize="md" color={colorMode === "light" ? "gray.600" : "gray.300"}>
          Mapping status, Button Behavior, dan Flow.
        </Text>
      </Box>

      <Box>
        <Heading size="md" mb={3}>
          Mapping Status & Action - MAKER
        </Heading>
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead bg={colorMode === "light" ? "gray.100" : "gray.700"}>
              <Tr>
                <Th>Aksi Pengguna</Th>
                <Th>Status Requirement</Th>
                <Th>Button Preview</Th>
                <Th>Button Start Review</Th>
                <Th>Action Approve</Th>
                <Th>Role</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>BRD/RFC Dibuat</Td>
                <Td><Badge colorScheme="gray">NEW</Badge></Td>
                <Td><Badge colorScheme="blue">Aktif</Badge></Td>
                <Td><Badge colorScheme="green">Aktif</Badge></Td>
                <Td><Badge colorScheme="red">TIDAK</Badge></Td>
                <Td><Badge colorScheme="green">MAKER</Badge></Td>
              </Tr>
              <Tr bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                <Td>DALAM PROSES REVIEW</Td>
                <Td><Badge colorScheme="blue">IN PROGRESS REVIEW</Badge></Td>
                <Td><Badge colorScheme="blue">Aktif</Badge></Td>
                <Td><Badge colorScheme="green">Aktif</Badge></Td>
                <Td><Badge colorScheme="red">TIDAK</Badge></Td>
                <Td><Badge colorScheme="green">MAKER</Badge></Td>
              </Tr>
              {/* <Tr>
                <Td>Review Dikirim</Td>
                <Td><Badge colorScheme="yellow">Dikirim</Badge></Td>
                <Td><Badge colorScheme="blue">Aktif</Badge></Td>
                <Td><Badge colorScheme="red">Nonaktif</Badge></Td>
                <Td><Badge colorScheme="green">MAKER</Badge></Td>
              </Tr> */}
              <Tr bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                <Td>Need Review</Td>
                <Td><Badge colorScheme="purple">Needs Review</Badge></Td>
                <Td><Badge colorScheme="blue">Aktif</Badge></Td>
                <Td><Badge colorScheme="green">Aktif</Badge></Td>
                <Td><Badge colorScheme="red">TIDAK</Badge></Td>
                <Td><Badge colorScheme="green">MAKER</Badge></Td>
              </Tr>
              <Tr bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                <Td>Memo Ditangguhkan</Td>
                <Td><Badge colorScheme="orange">ON HOLD</Badge></Td>
                <Td><Badge colorScheme="blue">Aktif</Badge></Td>
                <Td><Badge colorScheme="green">Aktif</Badge></Td>
                <Td><Badge colorScheme="red">TIDAK</Badge></Td>
                <Td><Badge colorScheme="green">MAKER</Badge></Td>
              </Tr>
              <Tr>
                <Td>Disetujui</Td>
                <Td><Badge colorScheme="green">APPROVED</Badge></Td>
                <Td><Badge colorScheme="blue">Aktif</Badge></Td>
                <Td><Badge colorScheme="red">Tidak Aktif</Badge></Td>
                <Td><Badge colorScheme="red">TIDAK</Badge></Td>
                <Td><Badge colorScheme="green">MAKER</Badge></Td>
              </Tr>
              <Tr bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                <Td>Ditolak</Td>
                <Td><Badge colorScheme="red">DECLINED</Badge></Td>
                <Td><Badge colorScheme="blue">Aktif</Badge></Td>
                <Td><Badge colorScheme="green">Aktif</Badge></Td>
                <Td><Badge colorScheme="red">TIDAK</Badge></Td>
                <Td><Badge colorScheme="green">MAKER</Badge></Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
      </Box>
      {/* USER APPROVER */}
      <Box>
        <Heading size="md" mb={3}>
          Mapping Status & Action - APPROVER
        </Heading>
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead bg={colorMode === "light" ? "gray.100" : "gray.700"}>
              <Tr>
                <Th>Aksi Pengguna</Th>
                <Th>Status Requirement</Th>
                <Th>Button Preview</Th>
                <Th>Button Start Review</Th>
                <Th>Action Approve</Th>
                <Th>Role</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>BRD/RFC Dibuat</Td>
                <Td><Badge colorScheme="gray">NEW</Badge></Td>
                <Td><Badge colorScheme="blue">Aktif</Badge></Td>
                <Td><Badge colorScheme="red">Tidak Aktif</Badge></Td>
                <Td><Badge colorScheme="yellow">YA</Badge></Td>
                <Td><Badge colorScheme="purple">APPROVER</Badge></Td>
              </Tr>
              <Tr bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                <Td>DALAM PROSES REVIEW</Td>
                <Td><Badge colorScheme="blue">IN PROGRESS REVIEW</Badge></Td>
                <Td><Badge colorScheme="blue">Aktif</Badge></Td>
                <Td><Badge colorScheme="red">Tidak Aktif</Badge></Td>
                <Td><Badge colorScheme="yellow">YA</Badge></Td>
                <Td><Badge colorScheme="purple">APPROVER</Badge></Td>
              </Tr>
              {/* <Tr>
                <Td>Review Dikirim</Td>
                <Td><Badge colorScheme="yellow">Dikirim</Badge></Td>
                <Td><Badge colorScheme="blue">Aktif</Badge></Td>
                <Td><Badge colorScheme="red">Nonaktif</Badge></Td>
                <Td><Badge colorScheme="green">APPROVER</Badge></Td>
              </Tr> */}
              <Tr bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                <Td>Need Review</Td>
                <Td><Badge colorScheme="purple">Needs Review</Badge></Td>
                <Td><Badge colorScheme="blue">Aktif</Badge></Td>
                <Td><Badge colorScheme="red">Tidak Aktif</Badge></Td>
                <Td><Badge colorScheme="yellow">YA</Badge></Td>
                <Td><Badge colorScheme="purple">APPROVER</Badge></Td>
              </Tr>
              <Tr bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                <Td>Memo Ditangguhkan</Td>
                <Td><Badge colorScheme="orange">ON HOLD</Badge></Td>
                <Td><Badge colorScheme="blue">Aktif</Badge></Td>
                <Td><Badge colorScheme="red">Tidak Aktif</Badge></Td>
                <Td><Badge colorScheme="yellow">YA</Badge></Td>
                <Td><Badge colorScheme="purple">APPROVER</Badge></Td>
              </Tr>
              <Tr>
                <Td>Disetujui</Td>
                <Td><Badge colorScheme="green">APPROVED</Badge></Td>
                <Td><Badge colorScheme="blue">Aktif</Badge></Td>
                <Td><Badge colorScheme="red">Tidak Aktif</Badge></Td>
                <Td><Badge colorScheme="yellow">YA</Badge></Td>
                <Td><Badge colorScheme="purple">APPROVER</Badge></Td>
              </Tr>
              <Tr bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                <Td>Ditolak</Td>
                <Td><Badge colorScheme="red">DECLINED</Badge></Td>
                <Td><Badge colorScheme="blue">Aktif</Badge></Td>
                <Td><Badge colorScheme="red">Tidak Aktif</Badge></Td>
                <Td><Badge colorScheme="yellow">YA</Badge></Td>
                <Td><Badge colorScheme="purple">APPROVER</Badge></Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
      </Box>

      <Card borderLeft="4px solid" borderColor="blue.500">
        <CardBody>
          <Heading size="md" mb={3}>
            Button Behavior
          </Heading>
          <VStack spacing={3} align="stretch">
            <Box>
              <HStack mb={2}>
                <Icon as={FiEye} color="blue.500" />
                <Text fontWeight="bold">Button Preview</Text>
              </HStack>
              <Text pl={6} fontSize="sm">
                Selalu tersedia untuk melihat detail Requirement. Dapat diakses oleh Role MAKER dan APPROVER pada status apa pun.
              </Text>
            </Box>
            <Box>
              <HStack mb={2}>
                <Icon as={FiUser} color="green.500" />
                <Text fontWeight="bold">Button Start Review</Text>
              </HStack>
              <Text pl={6} fontSize="sm">
                Hanya tersedia untuk Role MAKER. Aktif ketika Requirement baru atau ditolak. Nonaktif setelah pengiriman hingga Requirement ditolak dan dikembalikan.
              </Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      <Card borderLeft="4px solid" borderColor="orange.500">
        <CardBody>
          <Heading size="md" mb={3}>
            Counting Review
          </Heading>
          <VStack spacing={2} align="stretch">
            <HStack>
              <Icon as={FiClock} color="orange.500" />
              <Text>Counting review dimulai hanya setelah "Mulai Review" diklik.</Text>
            </HStack>
            <HStack>
              <Icon as={FiClock} color="orange.500" />
              <Text>Penghitung melacak hari kerja, bukan hari kalender.</Text>
            </HStack>
            <HStack>
              <Icon as={FiClock} color="orange.500" />
              <Text>Waktu review terlihat oleh Role MAKER dan APPROVER.</Text>
            </HStack>
            <HStack>
              <Icon as={FiClock} color="orange.500" />
              <Text>Penghitungan berhenti saat Requirement dikirim dan dilanjutkan jika ditolak.</Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      <Card bg={colorMode === "light" ? "blue.50" : "blue.900"}>
        <CardBody>
          <Heading size="md" mb={3}>
            Best Practice
          </Heading>
          <VStack spacing={3} align="stretch">
            <Box>
              <Text fontWeight="bold" mb={1}>Untuk MAKER:</Text>
              <Text pl={4} fontSize="sm">• START REVIEW hanya ketika Anda siap untuk memulai pekerjaan.</Text>
              <Text pl={4} fontSize="sm">• Lengkapi semua field yang diperlukan sebelum pengiriman.</Text>
              <Text pl={4} fontSize="sm">• Gunakan fungsi preview untuk memverifikasi pekerjaan Anda.</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" mb={1}>Untuk APPROVER:</Text>
              <Text pl={4} fontSize="sm">• Tinjau Requirement dengan segera untuk menghindari penundaan.</Text>
              <Text pl={4} fontSize="sm">• Berikan feedback yang spesifik dan dapat ditindaklanjuti saat menolak.</Text>
              <Text pl={4} fontSize="sm">• Gunakan preview untuk memeriksa Requirement sebelum dikirim.</Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}
