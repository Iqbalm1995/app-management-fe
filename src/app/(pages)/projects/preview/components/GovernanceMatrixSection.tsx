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
  Icon,
  useColorMode,
} from "@chakra-ui/react";
import { FiUsers, FiCompass, FiShield, FiSend, FiCheckCircle } from "react-icons/fi";
import { radiusStyle } from "@/app/constants/applicationConstants";

interface GovernanceMatrixSectionProps {
  DataProject: ProjectDataResponse;
}

export const GovernanceMatrixSection = ({
  DataProject,
}: GovernanceMatrixSectionProps) => {
  const { colorMode } = useColorMode();

  const borderColor = colorMode === "light" ? "gray.200" : "gray.700";
  const bgCard = colorMode === "light" ? "white" : "gray.800";
  const subBg = colorMode === "light" ? "gray.50" : "gray.900";

  const InfoRow = ({
    label,
    value,
    badge,
  }: {
    label: string;
    value?: string | null;
    badge?: string | null;
  }) => (
    <Box>
      <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="bold">
        {label}
      </Text>
      <HStack spacing={2} mt={0.5}>
        <Text
          fontSize="sm"
          fontWeight="semibold"
          color={colorMode === "light" ? "gray.800" : "gray.100"}
        >
          {value || "-"}
        </Text>
        {badge && (
          <Badge colorScheme="blue" fontSize="2xs">
            {badge}
          </Badge>
        )}
      </HStack>
    </Box>
  );

  return (
    <Card
      shadow="sm"
      rounded={radiusStyle}
      border="1px"
      borderColor={borderColor}
      bg={bgCard}
      overflow="hidden"
    >
      <CardHeader
        bg={colorMode === "light" ? "secondary.50" : "gray.900"}
        borderBottom="1px"
        borderColor={borderColor}
        py={4}
        px={6}
      >
        <HStack spacing={3}>
          <Box
            w={9}
            h={9}
            bgGradient="linear(135deg, secondary.500, secondary.700)"
            rounded="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            shadow="sm"
          >
            <FiCompass size={18} />
          </Box>
          <VStack align="start" spacing={0}>
            <Heading size="sm" color={colorMode === "light" ? "secondary.800" : "secondary.200"}>
              Governance & Organizational Ownership Matrix
            </Heading>
            <Text fontSize="xs" color="gray.500">
              Structure of requesting (initiator) and managing (IT delivery) organizational units
            </Text>
          </VStack>
        </HStack>
      </CardHeader>

      <CardBody p={6}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Kolom 1: Unit Pemohon / Inisiator */}
          <Box
            p={5}
            rounded={radiusStyle}
            border="1px solid"
            borderColor={borderColor}
            bg={subBg}
          >
            <HStack spacing={2} mb={4} pb={2} borderBottom="1px dashed" borderColor={borderColor}>
              <Icon as={FiSend} color="blue.500" boxSize={4} />
              <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="blue.600">
                Requesting Unit (Initiator)
              </Heading>
            </HStack>

            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="blue.700" mb={2}>
                  Project Initiation
                </Text>
                <VStack spacing={3} align="stretch" pl={2}>
                  <InfoRow
                    label="Initiator Directorate"
                    value={DataProject.proOwnerDirectorateName}
                  />
                  <InfoRow
                    label="Initiator Division"
                    value={DataProject.proOwnerDivisionName}
                  />
                  {DataProject.proOwnerGroupName && (
                    <InfoRow
                      label="Initiator Group"
                      value={DataProject.proOwnerGroupName}
                    />
                  )}
                </VStack>
              </Box>

              {DataProject.requirementData && (
                <>
                  <Divider borderColor={borderColor} />
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="blue.700" mb={2}>
                      Requirement Memo Initiation
                    </Text>
                    <VStack spacing={3} align="stretch" pl={2}>
                      <InfoRow
                        label="Memo Sender Directorate"
                        value={DataProject.requirementData.senderDirectorateName}
                      />
                      <InfoRow
                        label="Memo Sender Division"
                        value={DataProject.requirementData.senderDivisionName}
                      />
                    </VStack>
                  </Box>
                </>
              )}
            </VStack>
          </Box>

          {/* Kolom 2: Unit Pengelola / Pelaksana IT */}
          <Box
            p={5}
            rounded={radiusStyle}
            border="1px solid"
            borderColor={borderColor}
            bg={subBg}
          >
            <HStack spacing={2} mb={4} pb={2} borderBottom="1px dashed" borderColor={borderColor}>
              <Icon as={FiShield} color="purple.500" boxSize={4} />
              <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="purple.600">
                Managing Unit (IT Delivery)
              </Heading>
            </HStack>

            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="purple.700" mb={2}>
                  Project Management (IT)
                </Text>
                <VStack spacing={3} align="stretch" pl={2}>
                  <InfoRow
                    label="Managing Directorate"
                    value={DataProject.proManageByDirectorateName}
                  />
                  <InfoRow
                    label="Managing Division"
                    value={DataProject.proManageByDivisionName}
                  />
                  <InfoRow
                    label="Managing Group"
                    value={DataProject.proManageByGroupName}
                  />
                  {DataProject.proManageByTeamName && (
                    <InfoRow
                      label="Managing Team"
                      value={DataProject.proManageByTeamName}
                    />
                  )}
                </VStack>
              </Box>

              {DataProject.requirementData?.reqManageByDivisionName && (
                <>
                  <Divider borderColor={borderColor} />
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="purple.700" mb={2}>
                      Requirement Memo Management
                    </Text>
                    <VStack spacing={3} align="stretch" pl={2}>
                      <InfoRow
                        label="Memo Managing Directorate"
                        value={DataProject.requirementData.reqManageByDirectorateName}
                      />
                      <InfoRow
                        label="Memo Managing Division"
                        value={DataProject.requirementData.reqManageByDivisionName}
                      />
                      {DataProject.requirementData.reqManageByGroupName && (
                        <InfoRow
                          label="Memo Managing Group"
                          value={DataProject.requirementData.reqManageByGroupName}
                        />
                      )}
                    </VStack>
                  </Box>
                </>
              )}
            </VStack>
          </Box>
        </SimpleGrid>
      </CardBody>
    </Card>
  );
};
