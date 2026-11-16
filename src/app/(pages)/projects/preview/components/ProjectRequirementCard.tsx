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
import { FiFileText, FiInfo, FiTag, FiClock, FiLayers } from "react-icons/fi";
import { radiusStyle } from "@/app/constants/applicationConstants";

interface ProjectRequirementCardProps {
  DataProject: ProjectDataResponse;
}

export const ProjectRequirementCard = ({
  DataProject,
}: ProjectRequirementCardProps) => {
  const { colorMode } = useColorMode();
  const req = DataProject.requirementData;

  const borderColor = colorMode === "light" ? "gray.200" : "gray.700";
  const bgCard = colorMode === "light" ? "white" : "gray.800";
  const subBg = colorMode === "light" ? "gray.50" : "gray.900";

  const InfoBlock = ({
    label,
    value,
    badge,
    badgeColor = "blue",
  }: {
    label: string;
    value?: string | null;
    badge?: string | null;
    badgeColor?: string;
  }) => (
    <Box>
      <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="bold">
        {label}
      </Text>
      <HStack spacing={2} mt={1} wrap="wrap">
        <Text
          fontSize="sm"
          fontWeight="semibold"
          color={colorMode === "light" ? "gray.800" : "gray.100"}
        >
          {value || "-"}
        </Text>
        {badge && (
          <Badge colorScheme={badgeColor} fontSize="2xs" px={2} py={0.5} rounded="md">
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
      mb={6}
    >
      <CardHeader
        bg={colorMode === "light" ? "blue.50" : "gray.900"}
        borderBottom="1px"
        borderColor={borderColor}
        py={4}
        px={6}
      >
        <HStack spacing={3}>
          <Box
            w={9}
            h={9}
            bgGradient="linear(135deg, blue.500, blue.700)"
            rounded="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            shadow="sm"
          >
            <FiFileText size={18} />
          </Box>
          <VStack align="start" spacing={0}>
            <Heading size="sm" color={colorMode === "light" ? "blue.800" : "blue.200"}>
              Basis of Submission & Project Characteristics
            </Heading>
            <Text fontSize="xs" color="gray.500">
              Requirement memo details, project narrative, and technical specifications
            </Text>
          </VStack>
        </HStack>
      </CardHeader>

      <CardBody p={6}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Kolom Kiri: Dasar Memo Kebutuhan */}
          <Box
            p={5}
            rounded={radiusStyle}
            border="1px solid"
            borderColor={borderColor}
            bg={subBg}
          >
            <HStack spacing={2} mb={4} pb={2} borderBottom="1px dashed" borderColor={borderColor}>
              <Icon as={FiFileText} color="blue.500" boxSize={4} />
              <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="blue.600">
                Requirement Memo Basis
              </Heading>
            </HStack>

            {req ? (
              <VStack spacing={3.5} align="stretch">
                <InfoBlock
                  label="Memo Number"
                  value={req.reqNumber}
                  badge={req.requirementType}
                  badgeColor={req.requirementType === "RFC" ? "purple" : "blue"}
                />
                <InfoBlock
                  label="Memo Subject"
                  value={req.reqNarative}
                />
                <HStack spacing={4}>
                  <InfoBlock
                    label="Memo Date"
                    value={
                      req.reqInititateDate
                        ? new Date(req.reqInititateDate).toLocaleDateString("id-ID")
                        : "-"
                    }
                  />
                  <InfoBlock
                    label="Accepted Date"
                    value={
                      req.reqAcceptedDate
                        ? new Date(req.reqAcceptedDate).toLocaleDateString("id-ID")
                        : "-"
                    }
                  />
                </HStack>
              </VStack>
            ) : (
              <Box py={6} textAlign="center">
                <Text fontSize="sm" color="gray.500">
                  Not linked to requirement memo (Direct Initiation)
                </Text>
              </Box>
            )}
          </Box>

          {/* Kolom Kanan: Karakteristik & Teknis Proyek */}
          <Box
            p={5}
            rounded={radiusStyle}
            border="1px solid"
            borderColor={borderColor}
            bg={subBg}
          >
            <HStack spacing={2} mb={4} pb={2} borderBottom="1px dashed" borderColor={borderColor}>
              <Icon as={FiTag} color="teal.500" boxSize={4} />
              <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="teal.600">
                Specifications & Characteristics
              </Heading>
            </HStack>

            <VStack spacing={3.5} align="stretch">
              <InfoBlock
                label="Acquisition Type"
                value={DataProject.projectAcquisitionName || "In-House"}
                badge={DataProject.projectCategory}
                badgeColor="cyan"
              />
              <SimpleGrid columns={2} spacing={3}>
                <InfoBlock
                  label="Characteristic"
                  value={DataProject.projectCharasteristicName}
                />
                <InfoBlock
                  label="Sub-Characteristic"
                  value={DataProject.projectSubCharasteristicName}
                />
              </SimpleGrid>
              <InfoBlock
                label="Target SDLC Methodology"
                value={DataProject.sdlcName || "Standard SDLC"}
                badge="Methodology"
                badgeColor="green"
              />
              {DataProject.projectDesc && (
                <Box pt={1}>
                  <Text fontSize="2xs" color="gray.500" textTransform="uppercase" fontWeight="bold">
                    Project Brief Narrative
                  </Text>
                  <Text fontSize="xs" color="gray.600" mt={1} noOfLines={3}>
                    {DataProject.projectDesc}
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>
        </SimpleGrid>
      </CardBody>
    </Card>
  );
};
