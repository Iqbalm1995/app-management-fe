"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Box,
  Text,
  HStack,
  VStack,
  useColorMode,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Divider,
} from "@chakra-ui/react";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";

interface WorkProgramsSectionProps {
  DataProject: ProjectDataResponse;
}

export const WorkProgramsSection = ({ DataProject }: WorkProgramsSectionProps) => {
  const { colorMode } = useColorMode();

  const hasWorkPrograms = DataProject.workPrograms && DataProject.workPrograms.length > 0;

  const getLeftoverColor = (leftover: number) => {
    if (leftover < 0) return "red.500";
    if (leftover > 0) return "green.500";
    return colorMode === "light" ? "gray.600" : "gray.300";
  };

  return (
    <Card shadow="sm" rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
      <CardHeader bg={colorMode === "light" ? "purple.50" : "purple.900"} roundedTop="xl" py={4}>
        <HStack spacing={3}>
          <Box
            w={10}
            h={10}
            bgGradient="linear(135deg, purple.400, purple.600)"
            rounded="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <LiaFileInvoiceDollarSolid size={20} color="white" />
          </Box>
          <Heading size="md" color={colorMode === "light" ? "purple.700" : "purple.200"}>
            Work Programs
          </Heading>
        </HStack>
      </CardHeader>
      <CardBody p={6}>
        {!hasWorkPrograms ? (
          <Box textAlign="center" py={8}>
            <Text color={colorMode === "light" ? "gray.500" : "gray.400"}>
              No work programs data available
            </Text>
          </Box>
        ) : (
          <VStack align="stretch" spacing={4}>
            {DataProject.workPrograms.map((program, idx) => (
              <Box key={idx}>
                {idx > 0 && <Divider my={2} />}
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontWeight="bold" fontSize="md">
                        Nama Program Kerja
                      </Text>
                      <Text fontWeight="bold" fontSize="md" color={colorMode === "light" ? "purple.700" : "purple.200"}>
                        {program.workProgramName || "Program"}
                      </Text>
                      {program.workProgramCode && (
                        <Text fontSize="xs" color={colorMode === "light" ? "gray.500" : "gray.400"}>
                          Kode Program Kerja: {program.workProgramCode}
                        </Text>
                      )}
                    </VStack>
                    <Badge colorScheme="purple" variant="solid">
                      {program.workProgramSource || "Program"}
                    </Badge>
                  </HStack>

                  <VStack spacing={2} fontSize="sm" align="start" w="full">
                    {program.directorateName && (
                      <HStack spacing={2}>
                        <Text color={colorMode === "light" ? "gray.600" : "gray.400"}>Direktorat:</Text>
                        <Text fontWeight="semibold">{program.directorateName}</Text>
                      </HStack>
                    )}
                    {program.divisionName && (
                      <HStack spacing={2}>
                        <Text color={colorMode === "light" ? "gray.600" : "gray.400"}>Divisi:</Text>
                        <Text fontWeight="semibold">{program.divisionName}</Text>
                      </HStack>
                    )}
                  </VStack>

                  {program.workProgramAccName && (
                    <Box fontSize="sm" p={2} bg={colorMode === "light" ? "gray.50" : "gray.800"} rounded="md" w="full">
                      <VStack align="start" spacing={1}>
                        <Text color={colorMode === "light" ? "gray.600" : "gray.400"}>Nomor Rekening</Text>
                        <Text fontWeight="semibold">{program.workProgramAccName}</Text>
                        {program.workProgramAccNumber && (
                          <Text fontSize="xs" color={colorMode === "light" ? "gray.500" : "gray.500"}>
                            {program.workProgramAccNumber}
                          </Text>
                        )}
                      </VStack>
                    </Box>
                  )}

                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr bg={colorMode === "light" ? "gray.100" : "gray.700"}>
                        <Th>Anggaran</Th>
                        <Th>Realisasi</Th>
                        <Th>Sisa Anggaran</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td
                          fontWeight="semibold"
                          color={colorMode === "light" ? "gray.600" : "gray.400"}
                        >
                          Rp. {program.workProgramBudget?.toLocaleString() || "0"}
                        </Td>

                        <Td
                          fontWeight="semibold"
                          color={colorMode === "light" ? "red.600" : "red.300"}
                        >
                          Rp. {program.workProgramReal?.toLocaleString() || "0"}
                        </Td>

                        <Td>
                          <Text
                            fontWeight="bold"
                            color={colorMode === "light" ? "green.600" : "green.300"}
                          >
                            Rp. {(program.workProgramLeftovers || 0).toLocaleString()}
                          </Text>
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </VStack>
              </Box>
            ))}
          </VStack>
        )}
      </CardBody>
    </Card>
  );
};
