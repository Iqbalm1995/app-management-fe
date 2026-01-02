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
} from "@chakra-ui/react";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { FiCheckCircle, FiClock, FiEye, FiPlay, FiSend, FiUser, FiLayers } from "react-icons/fi";
import { Button } from "@chakra-ui/react";

export default function KnowledgeBaseView() {
  const { colorMode } = useColorMode();
  const [activeGuide, setActiveGuide] = useState<string>("requirement-flow");

  const guideItems = [
    { id: "requirement-flow", label: "Requirement Flow", icon: FiLayers },
    // Add more guides here in the future
  ];

  return (
    <LayoutAdmin>
      <Box p={6}>
        <Heading size="lg" mb={6}>
          BJB aPPs User Guide
        </Heading>

        <Flex gap={6} direction={{ base: "column", lg: "row" }}>
          {/* Left Side Navigation for Guides */}
          <Box
            w={{ base: "100%", lg: "220px" }}
            flexShrink={0}
          >
            <Card
              bg={colorMode === "light" ? "white" : "gray.800"}
              shadow="md"
              position={{ base: "relative", lg: "sticky" }}
              top={{ base: "0", lg: "20px" }}
              borderRadius="lg"
            >
              <CardBody p={4}>
                <VStack spacing={2} align="stretch">
                  <Text fontSize="xs" fontWeight="bold" color={colorMode === "light" ? "gray.500" : "gray.400"} textTransform="uppercase" mb={2}>
                    Panduan Pengguna
                  </Text>
                  {guideItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeGuide === item.id ? "solid" : "ghost"}
                      colorScheme={activeGuide === item.id ? "blue" : "gray"}
                      justifyContent="flex-start"
                      leftIcon={<Icon as={item.icon} />}
                      onClick={() => setActiveGuide(item.id)}
                      size="sm"
                      fontSize="sm"
                    >
                      {item.label}
                    </Button>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </Box>

          {/* Main Content Area */}
          <Box>
            {activeGuide === "requirement-flow" && <RequirementFlowContent colorMode={colorMode} />}
            {/* Add more guide content components here */}
          </Box>
        </Flex>
      </Box>
    </LayoutAdmin>
  );
}

// Requirement Flow Content (formerly the main content)
function RequirementFlowContent({ colorMode }: { colorMode: string }) {
  return (
    <Box>
      {/* Navigation Panel - Now at top */}

      {/* Main Content Area with Tabs */}
      <Box>
        <Card
          bg={colorMode === "light" ? "white" : "gray.800"}
          shadow="md"
          borderRadius="lg"
          w="full"
        >
          <CardBody p={6}>
            <Tabs colorScheme="blue" variant="enclosed">
              <TabList>
                <Tab>
                  <Icon as={FiEye} mr={2} />
                  Ringkasan
                </Tab>
                <Tab>
                  <Icon as={FiUser} mr={2} />
                  Alur MAKER
                </Tab>
                <Tab>
                  <Icon as={FiCheckCircle} mr={2} />
                  Alur APPROVAL
                </Tab>
                <Tab>
                  <Icon as={FiClock} mr={2} />
                  Status & Aturan
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel px={0} py={6}>
                  <Flex w="full">
                    <Box flex={1}>
                      <OverviewContent colorMode={colorMode} />
                    </Box>
                  </Flex>
                </TabPanel>
                <TabPanel px={0} py={6}>
                  <Flex w="full">
                    <Box flex={1}>
                      <MakerFlowContent colorMode={colorMode} />
                    </Box>
                  </Flex>
                </TabPanel>
                <TabPanel px={0} py={6}>
                  <Flex w="full">
                    <Box flex={1}>
                      <ApprovalFlowContent colorMode={colorMode} />
                    </Box>
                  </Flex>
                </TabPanel>
                <TabPanel px={0} py={6}>
                  <Flex w="full">
                    <Box flex={1}>
                      <StatusAndRulesContent colorMode={colorMode} />
                    </Box>
                  </Flex>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}

// Overview Content
function OverviewContent({ colorMode }: { colorMode: string }) {
  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="lg" mb={4}>
          Ringkasan Alur Kerja BRD / RFC
        </Heading>
        <Text fontSize="md" color={colorMode === "light" ? "gray.600" : "gray.300"} mb={4}>
          Proses BRD (Business Requirements Document) dan RFC (Request for Change) mengikuti alur kerja terstruktur berbasis peran yang dirancang untuk memastikan kualitas dan akuntabilitas di setiap tahap.
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
              <Text>Alur kerja berbasis peran dengan tanggung jawab yang jelas</Text>
            </HStack>
            <HStack>
              <Icon as={FiCheckCircle} color="blue.500" />
              <Text>Proses berurutan mencegah tahapan yang terlewat</Text>
            </HStack>
            <HStack>
              <Icon as={FiCheckCircle} color="blue.500" />
              <Text>Visibilitas tombol berdasarkan status untuk memastikan alur yang tepat</Text>
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
          Peran dalam Alur Kerja
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
                Bertanggung jawab untuk menerima BRD/RFC, menginput kebutuhan, memulai review, dan mengirimkan pekerjaan yang telah selesai untuk disetujui.
              </Text>
            </CardBody>
          </Card>

          <Card bg={colorMode === "light" ? "purple.50" : "purple.900"}>
            <CardBody>
              <HStack mb={2}>
                <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                  APPROVAL
                </Badge>
              </HStack>
              <Text>
                Bertanggung jawab untuk meninjau kebutuhan yang telah dikirim, memberikan feedback, dan menyetujui atau menolak pekerjaan.
              </Text>
            </CardBody>
          </Card>
        </VStack>
      </Box>

      <Box>
        <Heading size="md" mb={3}>
          Alur Proses
        </Heading>
        <Text mb={3}>
          Alur kerja berjalan secara berurutan dari MAKER ke APPROVAL:
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
          <Icon as={FiSend} boxSize={6} color="blue.500" />
          <Card flex={1} bg={colorMode === "light" ? "purple.50" : "purple.900"} textAlign="center">
            <CardBody>
              <Badge colorScheme="purple" mb={2}>APPROVAL</Badge>
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
      description: "BRD atau RFC baru ditugaskan kepada Anda. Kebutuhan muncul dalam daftar kebutuhan Anda dengan status \"Baru\" atau \"Pending\".",
    },
    {
      title: "Input Kebutuhan",
      description: "Buka kebutuhan dan isi semua detail yang diperlukan, termasuk deskripsi, kriteria penerimaan, dan lampiran.",
    },
    {
      title: "Lihat dalam Tabel Kebutuhan",
      description: "Kebutuhan ditampilkan dalam tabel dengan aksi: Preview (lihat detail kebutuhan, selalu tersedia) dan Mulai Review (memulai proses review).",
    },
    {
      title: "Mulai Review",
      description: "Ketika Anda klik \"Mulai Review\": Penghitungan hari review dimulai secara otomatis dan status kebutuhan berubah menjadi \"Dalam Proses\" atau \"Sedang Review\".",
    },
    {
      title: "Selesaikan dan Kirim Review",
      description: "Setelah menyelesaikan review Anda, kirim kebutuhan untuk disetujui. Ini memindahkan alur kerja ke peran APPROVAL.",
    },
    {
      title: "Status Setelah Pengiriman",
      description: "Setelah pengiriman: Tombol \"Mulai Review\" tidak lagi tersedia (Nonaktif), sedangkan tombol \"Preview\" tetap tersedia untuk melihat (Aktif).",
    },
  ];


  return (

      <VStack spacing={6} align="stretch">
      <Box>
        <HStack mb={4}>
          <Badge colorScheme="green" fontSize="lg" px={4} py={2}>
            USER MAKER
          </Badge>
          <Heading size="lg">Register Requirements Flow</Heading>
        </HStack>
        <Text fontSize="md" color={colorMode === "light" ? "gray.600" : "gray.300"}>
          Ikuti langkah-langkah berikut untuk memproses kebutuhan sebagai MAKER.
        </Text>
      </Box>

      <VStack spacing={8} align="stretch">
        {steps.map((step, index) => (
          <HStack key={index} align="flex-start" spacing={4}>
            <Box
              minW="40px"
              h="40px"
              borderRadius="full"
              borderWidth="2px"
              borderColor="green.500"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="bold"
              color="green.500"
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

// APPROVAL Flow Content
function ApprovalFlowContent({ colorMode }: { colorMode: string }) {
  const steps = [
    {
      title: "Menerima BRD/RFC",
      description: "BRD atau RFC dikirim oleh MAKER dan muncul dalam antrian persetujuan Anda. Anda menerima notifikasi bahwa kebutuhan siap untuk ditinjau.",
    },
    {
      title: "Lihat Daftar Kebutuhan",
      description: "Kebutuhan yang menunggu persetujuan ditampilkan dalam tabel. Anda dapat melihat status dan aksi yang tersedia untuk setiap kebutuhan.",
    },
    {
      title: "Preview Sebelum Pengiriman",
      description: "Saat MAKER belum mengirim review: Tombol \"Preview\" terlihat dan Anda dapat melihat kebutuhan tetapi belum dapat mengambil tindakan.",
    },
    {
      title: "Tinjau Kebutuhan yang Dikirim",
      description: "Setelah MAKER mengirim review: Status kebutuhan berubah menjadi \"Dikirim\" atau \"Menunggu Persetujuan\" dan Anda sekarang dapat meninjau detail kebutuhan secara lengkap.",
    },
    {
      title: "Setujui atau Tolak",
      description: "Berdasarkan tinjauan Anda, Anda dapat: Setujui (terima kebutuhan dan pindahkan ke tahap berikutnya) atau Tolak (kirim kembali ke MAKER dengan feedback untuk revisi).",
    },
    {
      title: "Berikan Feedback",
      description: "Jika menolak, berikan feedback yang jelas menjelaskan apa yang perlu diubah. Kebutuhan kembali ke MAKER untuk revisi.",
    },
  ];


  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <HStack mb={4}>
          <Badge colorScheme="purple" fontSize="lg" px={4} py={2}>
            USER APPROVAL
          </Badge>
          <Heading size="lg">Register Requirements Flow</Heading>
        </HStack>
        <Text fontSize="md" color={colorMode === "light" ? "gray.600" : "gray.300"}>
          Ikuti langkah-langkah berikut untuk meninjau dan menyetujui kebutuhan sebagai APPROVER.
        </Text>
      </Box>

      <VStack spacing={8} align="stretch">
        {steps.map((step, index) => (
          <HStack key={index} align="flex-start" spacing={4}>
            <Box
              minW="40px"
              h="40px"
              borderRadius="full"
              borderWidth="2px"
              borderColor="purple.500"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="bold"
              color="purple.500"
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

// Status and Rules Combined Content
function StatusAndRulesContent({ colorMode }: { colorMode: string }) {
  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="lg" mb={4}>
          Status & Aturan
        </Heading>
        <Text fontSize="md" color={colorMode === "light" ? "gray.600" : "gray.300"}>
          Memahami transisi status, perilaku tombol, dan aturan alur kerja.
        </Text>
      </Box>

      {/* Status Mapping Table */}
      <Box>
        <Heading size="md" mb={3}>
          Pemetaan Status & Aksi
        </Heading>
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead bg={colorMode === "light" ? "gray.100" : "gray.700"}>
              <Tr>
                <Th>Aksi Pengguna</Th>
                <Th>Status Kebutuhan</Th>
                <Th>Tombol Preview</Th>
                <Th>Tombol Mulai Review</Th>
                <Th>Peran</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>BRD/RFC Dibuat</Td>
                <Td><Badge colorScheme="gray">Baru</Badge></Td>
                <Td><Badge colorScheme="blue">Aktif</Badge></Td>
                <Td><Badge colorScheme="green">Aktif</Badge></Td>
                <Td><Badge colorScheme="green">MAKER</Badge></Td>
              </Tr>
              <Tr bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                <Td>Mulai Review Diklik</Td>
                <Td><Badge colorScheme="orange">Dalam Proses</Badge></Td>
                <Td><Badge colorScheme="blue">Aktif</Badge></Td>
                <Td><Badge colorScheme="green">Aktif</Badge></Td>
                <Td><Badge colorScheme="green">MAKER</Badge></Td>
              </Tr>
              <Tr>
                <Td>Review Dikirim</Td>
                <Td><Badge colorScheme="yellow">Dikirim</Badge></Td>
                <Td><Badge colorScheme="blue">Aktif</Badge></Td>
                <Td><Badge colorScheme="red">Nonaktif</Badge></Td>
                <Td><Badge colorScheme="green">MAKER</Badge></Td>
              </Tr>
              <Tr bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                <Td>Menunggu Persetujuan</Td>
                <Td><Badge colorScheme="purple">Menunggu Persetujuan</Badge></Td>
                <Td><Badge colorScheme="blue">Aktif</Badge></Td>
                <Td><Badge colorScheme="gray">N/A</Badge></Td>
                <Td><Badge colorScheme="purple">APPROVAL</Badge></Td>
              </Tr>
              <Tr>
                <Td>Disetujui</Td>
                <Td><Badge colorScheme="green">Disetujui</Badge></Td>
                <Td><Badge colorScheme="blue">Aktif</Badge></Td>
                <Td><Badge colorScheme="gray">N/A</Badge></Td>
                <Td><Badge colorScheme="purple">APPROVAL</Badge></Td>
              </Tr>
              <Tr bg={colorMode === "light" ? "gray.50" : "gray.800"}>
                <Td>Ditolak</Td>
                <Td><Badge colorScheme="red">Ditolak</Badge></Td>
                <Td><Badge colorScheme="blue">Aktif</Badge></Td>
                <Td><Badge colorScheme="green">Aktif</Badge></Td>
                <Td><Badge colorScheme="green">MAKER</Badge></Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Button Behavior */}
      <Card borderLeft="4px solid" borderColor="blue.500">
        <CardBody>
          <Heading size="md" mb={3}>
            Perilaku Tombol
          </Heading>
          <VStack spacing={3} align="stretch">
            <Box>
              <HStack mb={2}>
                <Icon as={FiEye} color="blue.500" />
                <Text fontWeight="bold">Tombol Preview</Text>
              </HStack>
              <Text pl={6} fontSize="sm">
                Selalu tersedia untuk melihat detail kebutuhan. Dapat diakses oleh peran MAKER dan APPROVAL pada status apa pun.
              </Text>
            </Box>
            <Box>
              <HStack mb={2}>
                <Icon as={FiPlay} color="green.500" />
                <Text fontWeight="bold">Tombol Mulai Review</Text>
              </HStack>
              <Text pl={6} fontSize="sm">
                Hanya tersedia untuk peran MAKER. Aktif ketika kebutuhan baru atau ditolak. Nonaktif setelah pengiriman hingga kebutuhan ditolak dan dikembalikan.
              </Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Review Day Counting */}
      <Card borderLeft="4px solid" borderColor="orange.500">
        <CardBody>
          <Heading size="md" mb={3}>
            Penghitungan Hari Review
          </Heading>
          <VStack spacing={2} align="stretch">
            <HStack>
              <Icon as={FiClock} color="orange.500" />
              <Text>Penghitungan hari review dimulai hanya setelah "Mulai Review" diklik.</Text>
            </HStack>
            <HStack>
              <Icon as={FiClock} color="orange.500" />
              <Text>Penghitung melacak hari kerja, bukan hari kalender.</Text>
            </HStack>
            <HStack>
              <Icon as={FiClock} color="orange.500" />
              <Text>Waktu review terlihat oleh peran MAKER dan APPROVAL.</Text>
            </HStack>
            <HStack>
              <Icon as={FiClock} color="orange.500" />
              <Text>Penghitungan berhenti saat kebutuhan dikirim dan dilanjutkan jika ditolak.</Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Workflow Rules */}
      <Card borderLeft="4px solid" borderColor="purple.500">
        <CardBody>
          <Heading size="md" mb={3}>
            Aturan Alur Kerja
          </Heading>
          <VStack spacing={2} align="stretch">
            <HStack>
              <Icon as={FiCheckCircle} color="purple.500" />
              <Text>Setiap Step  harus diselesaikan sebelum pindah ke Step  berikutnya.</Text>
            </HStack>
            <HStack>
              <Icon as={FiCheckCircle} color="purple.500" />
              <Text>Step  tidak dapat dilewati atau dilakukan di luar urutan.</Text>
            </HStack>
            <HStack>
              <Icon as={FiCheckCircle} color="purple.500" />
              <Text>Visibilitas tombol berdasarkan peran dan status.</Text>
            </HStack>
            <HStack>
              <Icon as={FiCheckCircle} color="purple.500" />
              <Text>Indikator visual menunjukkan kemajuan saat ini dalam alur kerja.</Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Best Practices */}
      <Card bg={colorMode === "light" ? "blue.50" : "blue.900"}>
        <CardBody>
          <Heading size="md" mb={3}>
            Praktik Terbaik
          </Heading>
          <VStack spacing={3} align="stretch">
            <Box>
              <Text fontWeight="bold" mb={1}>Untuk MAKER:</Text>
              <Text pl={4} fontSize="sm">• Mulai review hanya ketika Anda siap untuk memulai pekerjaan.</Text>
              <Text pl={4} fontSize="sm">• Lengkapi semua field yang diperlukan sebelum pengiriman.</Text>
              <Text pl={4} fontSize="sm">• Gunakan fungsi preview untuk memverifikasi pekerjaan Anda.</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" mb={1}>Untuk APPROVAL:</Text>
              <Text pl={4} fontSize="sm">• Tinjau kebutuhan dengan segera untuk menghindari penundaan.</Text>
              <Text pl={4} fontSize="sm">• Berikan feedback yang spesifik dan dapat ditindaklanjuti saat menolak.</Text>
              <Text pl={4} fontSize="sm">• Gunakan preview untuk memeriksa kebutuhan sebelum dikirim.</Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}

