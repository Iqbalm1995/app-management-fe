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
  Badge,
  Avatar,
} from "@chakra-ui/react";
import { FiPackage } from "react-icons/fi";
import { getQuarterText } from "@/app/helper/MasterHelper";

interface ApplicationSectionProps {
  DataProject: ProjectDataResponse;
}

export const ApplicationSection = ({ DataProject }: ApplicationSectionProps) => {
  const { colorMode } = useColorMode();

  if (!DataProject.appsProject) {
    return null;
  }

  const app = DataProject.appsProject;

  return (
    <Card shadow="sm" rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
      <CardHeader
        bgGradient={colorMode === "light" ? "linear(to-b, secondary.500, secondary.800)" : "linear(to-b, secondary.600, secondary.900)"}
        roundedTop="xl"
        py={4}
      >
        <HStack spacing={3}>
          <Box
            w={10}
            h={10}
            bg="whiteAlpha.200"
            rounded="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FiPackage size={20} color="white" />
          </Box>
          <Heading size="md" color="white">
            Application Data
          </Heading>
        </HStack>
      </CardHeader>
      <CardBody p={6}>
        <VStack spacing={6} align="stretch">
          <HStack spacing={4}>
            <Avatar
              size="lg"
              name={app.appName}
              src={app.iconApps || undefined}
              bg="secondary.500"
              color="white"
            />
            <VStack align="start" spacing={1} flex={1}>
              <Text fontSize="lg" fontWeight="bold">
                {app.appName}
              </Text>
              <HStack spacing={2}>
                <Badge colorScheme="blue" fontSize="xs">
                  {app.appShortName}
                </Badge>
                <Badge
                  colorScheme={
                    app.appsStatus === "ACTIVE" ? "green" :
                      app.appsStatus === "DEVELOPMENT" ? "blue" :
                        app.appsStatus === "TESTING" ? "orange" : "red"
                  }
                  fontSize="xs"
                >
                  {app.appsStatus}
                </Badge>
              </HStack>
            </VStack>
            <VStack align="start" spacing={1} flex={1}>
              <Text fontSize="xs" color="gray.500" fontWeight="medium">Target Live Application</Text>
              <Badge
                colorScheme="blue"
                fontSize="sm"
                px={3}
                py={1}
                rounded="md"
              >
                {DataProject.requirementData?.appLiveTargetDate
                  ? new Date(DataProject.requirementData.appLiveTargetDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  : "-"}
              </Badge>
            </VStack>
            <VStack align="start" spacing={1} flex={1}>
              <Text fontSize="xs" color="gray.500" fontWeight="medium">Terbilang Target Live</Text>
              <Text fontSize="sm" fontWeight="semibold" color={colorMode === "light" ? "gray.800" : "white"}>
                {DataProject.requirementData?.appLiveTargetDate
                  ? getQuarterText(DataProject.requirementData.appLiveTargetDate)
                  : "-"}
              </Text>
            </VStack>
            <VStack align="start" spacing={1} flex={1}>
              <Text fontSize="xs" color="gray.500" fontWeight="medium">Catatan</Text>
              <Text fontSize="sm" fontWeight="semibold" color={colorMode === "light" ? "gray.800" : "white"} noOfLines={2}>
                {DataProject.requirementData?.note || "-"}
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};
