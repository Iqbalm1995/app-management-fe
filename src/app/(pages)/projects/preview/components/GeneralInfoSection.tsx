"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  SimpleGrid,
  Box,
  Text,
  Badge,
  HStack,
  VStack,
  Divider,
  useColorMode,
} from "@chakra-ui/react";
import { FiInfo } from "react-icons/fi";

interface GeneralInfoSectionProps {
  DataProject: ProjectDataResponse;
}

export const GeneralInfoSection = ({ DataProject }: GeneralInfoSectionProps) => {
  const { colorMode } = useColorMode();

  const InfoItem = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
    <Box>
      <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="semibold" color={colorMode === "light" ? "gray.800" : "white"}>
        {value || "N/A"}
      </Text>
    </Box>
  );

  const InfoItemBadge = ({ label, value, colorScheme = "blue" }: { label: string; value: string | null | undefined; colorScheme?: string }) => (
    <Box>
      <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium">
        {label}
      </Text>
      <Badge colorScheme={colorScheme} fontSize="sm" px={3} py={1} rounded="md">
        {value || "N/A"}
      </Badge>
    </Box>
  );

  return (
    <Card shadow="sm" rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
      <CardHeader bg={colorMode === "light" ? "blue.50" : "blue.900"} roundedTop="xl" py={4}>
        <HStack spacing={3}>
          <Box
            w={10}
            h={10}
            bgGradient="linear(135deg, blue.400, blue.600)"
            rounded="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FiInfo size={20} color="white" />
          </Box>
          <Heading size="md" color={colorMode === "light" ? "blue.700" : "blue.200"}>
            Informasi Umum
          </Heading>
        </HStack>
      </CardHeader>
      <CardBody p={6}>
        <VStack spacing={6} align="stretch">
          {/* Project Identification
          <Box>
            <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={3}>
              Identitas Project
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              <InfoItem label="Nomor Project" value={DataProject.projectNo} />
              <InfoItem label="Kode Project" value={DataProject.projectCode} />
              <InfoItemBadge label="Tipe Project" value={DataProject.projectType} colorScheme="purple" />
              <InfoItemBadge label="Kategori Project" value={DataProject.projectCategory} colorScheme="cyan" />
              {DataProject.projectAcquisitionName && (
                <InfoItemBadge label="Jenis Pengadaan" value={DataProject.projectAcquisitionName} colorScheme="orange" />
              )}
            </SimpleGrid>
          </Box> */}



          {/* Project Details */}
          <Box>
            <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={3}>
              Detail Project
            </Text>
            <VStack spacing={4} align="stretch">
              <InfoItem label="Nama Project" value={DataProject.projectName} />
              <Box>
                <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium">
                  Deskripsi Project
                </Text>
                <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                  {DataProject.projectDesc || "N/A"}
                </Text>
              </Box>
            </VStack>
          </Box>

          <Divider />

          {/* Characteristics */}
          <Box>
            <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={3}>
              Karakteristik Project
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <InfoItem label="Karakteristik" value={DataProject.projectCharasteristicName} />
              <InfoItem label="Sub-Karakteristik" value={DataProject.projectSubCharasteristicName} />
              {/* {DataProject.projectSubCharasteristicDesc && (
                <Box gridColumn={{ base: "1", md: "1 / -1" }}>
                  <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium">
                    Deskripsi Sub-Karakteristik
                  </Text>
                  <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                    {DataProject.projectSubCharasteristicDesc}
                  </Text>
                </Box>
              )} */}
            </SimpleGrid>
          </Box>

          <Divider />

          {/* Dates & Duration */}
          <Box>
            <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={3}>
              Tanggal Register
            </Text>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <InfoItem
                label="Tanggal Register"
                value={DataProject.projectRegisterDate ? new Date(DataProject.projectRegisterDate).toLocaleDateString('id-ID') : "N/A"}
              />
              {/* <InfoItem
                label="Tanggal Selesai"
                value={DataProject.projectClosedDate ? new Date(DataProject.projectClosedDate).toLocaleDateString('id-ID') : "N/A"}
              />
              <InfoItem
                label="Durasi (Hari)"
                value={DataProject.projectDurationDays || 0}
              /> */}
            </SimpleGrid>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};
