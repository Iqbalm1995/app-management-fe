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
import { FiBriefcase } from "react-icons/fi";
import { formatToRupiah } from "@/app/helper/MasterHelper";
import { radiusStyle } from "@/app/constants/applicationConstants";

interface WorkProgramsSectionProps {
  DataProject: ProjectDataResponse;
}

export const WorkProgramsSection = ({ DataProject }: WorkProgramsSectionProps) => {
  const { colorMode } = useColorMode();

  const hasWorkPrograms = DataProject.workPrograms && DataProject.workPrograms.length > 0;

  return (
    <Card
      shadow="sm"
      rounded={radiusStyle}
      border="1px"
      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
      overflow="hidden"
    >
      <CardHeader
        bg={colorMode === "light" ? "purple.50" : "purple.950"}
        borderBottom="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        py={4}
        px={6}
      >
        <HStack spacing={3}>
          <Box
            w={9}
            h={9}
            bgGradient="linear(135deg, purple.500, purple.700)"
            rounded="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            shadow="sm"
          >
            <FiBriefcase size={18} />
          </Box>
          <VStack align="start" spacing={0}>
            <Heading size="sm" color={colorMode === "light" ? "purple.800" : "purple.200"}>
              Work Programs
            </Heading>
            <Text fontSize="xs" color="gray.500">
              Allocated work programs, source accounts, and financial commitments
            </Text>
          </VStack>
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
          <VStack align="stretch" spacing={5}>
            {DataProject.workPrograms.map((program, idx) => (
              <Box
                key={idx}
                p={5}
                rounded={radiusStyle}
                border="1px solid"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "gray.50" : "gray.900"}
              >
                <VStack align="stretch" spacing={3.5}>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={0.5} flex={1}>
                      <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="bold">
                        Work Program Name
                      </Text>
                      <Text fontWeight="bold" fontSize="md" color={colorMode === "light" ? "purple.700" : "purple.200"}>
                        {program.workProgramName || "Program"}
                      </Text>
                      {program.workProgramCode && (
                        <Text fontSize="xs" color={colorMode === "light" ? "gray.500" : "gray.400"}>
                          Code: {program.workProgramCode}
                        </Text>
                      )}
                    </VStack>
                    <Badge colorScheme="purple" variant="solid" fontSize="xs">
                      {program.workProgramSource || "Program"}
                    </Badge>
                  </HStack>

                  <VStack spacing={1.5} fontSize="xs" align="start" w="full">
                    {program.directorateName && (
                      <HStack spacing={2}>
                        <Text color={colorMode === "light" ? "gray.600" : "gray.400"}>Directorate:</Text>
                        <Text fontWeight="semibold">{program.directorateName}</Text>
                      </HStack>
                    )}
                    {program.divisionName && (
                      <HStack spacing={2}>
                        <Text color={colorMode === "light" ? "gray.600" : "gray.400"}>Division:</Text>
                        <Text fontWeight="semibold">{program.divisionName}</Text>
                      </HStack>
                    )}
                  </VStack>

                  {program.workProgramAccName && (
                    <Box fontSize="xs" p={2.5} bg={colorMode === "light" ? "white" : "gray.800"} rounded="md" w="full" border="1px solid" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                      <VStack align="start" spacing={0.5}>
                        <Text color="gray.500" fontSize="2xs" textTransform="uppercase" fontWeight="bold">Account Details</Text>
                        <Text fontWeight="semibold">{program.workProgramAccName}</Text>
                        {program.workProgramAccNumber && (
                          <Text fontSize="xs" color="gray.500">
                            {program.workProgramAccNumber}
                          </Text>
                        )}
                      </VStack>
                    </Box>
                  )}

                  <Table size="sm" variant="simple" mt={1}>
                    <Thead>
                      <Tr bg={colorMode === "light" ? "white" : "gray.800"}>
                        <Th fontSize="2xs">Work Programs Budget</Th>
                        <Th fontSize="2xs">Work Programs Realization</Th>
                        <Th fontSize="2xs">Remaining Budget</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td fontWeight="semibold" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                          {formatToRupiah(program.workProgramBudget || 0)}
                        </Td>
                        <Td fontWeight="semibold" color="red.500">
                          {formatToRupiah(program.workProgramReal || 0)}
                        </Td>
                        <Td fontWeight="bold" color="green.600">
                          {formatToRupiah(program.workProgramLeftovers || 0)}
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
