"use client";

import {
  Box,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Text,
  Badge,
  Heading,
  Tooltip,
  useColorMode,
} from "@chakra-ui/react";
import { FiInfo } from "react-icons/fi";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { ProjectDataResponse, AppsResponse } from "@/app/services/useProjects";
import LoadingMiniSignature from "@/app/components/loadingMini";

interface ProjectPreviewSidebarProps {
  DataProject: ProjectDataResponse | null;
  DataApps: AppsResponse | null;
}

export const ProjectPreviewSidebar = ({
  DataProject,
  DataApps,
}: ProjectPreviewSidebarProps) => {
  const { colorMode } = useColorMode();

  return (
    <Box w={"full"} flexShrink={0}>
      <VStack spacing={{ base: 4, md: 6 }}>
        {DataProject?.appsProject && (
          <Card
            w="full"
            shadow="md"
            rounded={radiusStyle}
            border="1px"
            borderColor="gray.200"
            bgGradient="linear(to-b, secondary.400, secondary.600)"
            color="white"
            transition="all 0.3s ease"
            overflow="hidden"
            position="relative"
          >
            <Box
              position="absolute"
              top={{ base: "-5px", md: "-10px" }}
              right={{ base: "-20px", md: "-40px" }}
              zIndex={0}
              opacity={0.08}
              transform="rotate(15deg)"
            >
              <Box
                as="img"
                src="/img/logo-bjb-black-wing.svg"
                alt="BJB Logo Background"
                w={{ base: "180px", md: "240px" }}
                h="auto"
                filter="brightness(0) invert(1)"
              />
            </Box>
            <CardBody p={{ base: 6, md: 8 }} position="relative" zIndex={1}>
              <VStack spacing={{ base: 4, md: 6 }} align="center">
                <Box position="relative">
                  <Box
                    w={{ base: 16, md: 20 }}
                    h={{ base: 16, md: 20 }}
                    bgGradient="linear(135deg, whiteAlpha.200, whiteAlpha.400)"
                    rounded="3xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize={{ base: "2xl", md: "3xl" }}
                    fontWeight="bold"
                    shadow="2xl"
                    border="3px solid"
                    borderColor="whiteAlpha.300"
                    backdropFilter="blur(10px)"
                    position="relative"
                  >
                    {DataProject.appsProject.iconApps ? (
                      <img
                        src={DataProject.appsProject.iconApps}
                        alt="App Icon"
                        style={{
                          width: "60%",
                          height: "60%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <Text color="white" fontSize="2xl">
                        {DataProject.appsProject.appName?.charAt(0) || "A"}
                      </Text>
                    )}
                  </Box>
                  <Box
                    position="absolute"
                    top={-1}
                    right={-1}
                    w={6}
                    h={6}
                    bg={
                      DataProject.appsProject.appsStatus === "ACTIVE"
                        ? "green.400"
                        : DataProject.appsProject.appsStatus === "DEVELOPMENT"
                        ? "blue.400"
                        : DataProject.appsProject.appsStatus === "TESTING"
                        ? "orange.400"
                        : "red.400"
                    }
                    rounded="full"
                    border="2px solid white"
                    shadow="md"
                  />
                </Box>
                <VStack spacing={2} align="center">
                  <Text
                    fontSize="xl"
                    fontWeight="bold"
                    color="white"
                    textAlign="center"
                    lineHeight="shorter"
                    noOfLines={2}
                    maxW="200px"
                  >
                    {DataProject.appsProject.appName}
                  </Text>
                  <Badge
                    bg="whiteAlpha.200"
                    color="white"
                    px={3}
                    py={1}
                    rounded="full"
                    fontSize="xs"
                    fontWeight="bold"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                  >
                    {DataProject.appsProject.appShortName}
                  </Badge>
                </VStack>
                <VStack spacing={1} align="center">
                  <Text
                    fontSize="xs"
                    color="whiteAlpha.700"
                    fontWeight="medium"
                  >
                    STATUS
                  </Text>
                  <Badge
                    colorScheme={
                      DataProject.appsProject.appsStatus === "ACTIVE"
                        ? "green"
                        : DataProject.appsProject.appsStatus === "DEVELOPMENT"
                        ? "blue"
                        : DataProject.appsProject.appsStatus === "TESTING"
                        ? "orange"
                        : "red"
                    }
                    size="sm"
                    px={2}
                    py={1}
                    rounded="full"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {DataProject.appsProject.appsStatus}
                  </Badge>
                </VStack>
                <Box
                  bg="whiteAlpha.100"
                  backdropFilter="blur(10px)"
                  p={3}
                  rounded="lg"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  w="full"
                >
                  <VStack spacing={2}>
                    <HStack justify="space-between" w="full">
                      <Text
                        fontSize="xs"
                        color="whiteAlpha.700"
                        fontWeight="medium"
                      >
                        DIVISION OWNER
                      </Text>
                      <Tooltip
                        label={DataProject.proOwnerDivisionName}
                        placement="top"
                      >
                        <Text
                          fontSize="xs"
                          fontWeight="bold"
                          color="white"
                          maxW="200px"
                          isTruncated
                        >
                          {DataProject.proOwnerDivisionName}
                        </Text>
                      </Tooltip>
                    </HStack>
                    <HStack justify="space-between" w="full">
                      <Text
                        fontSize="xs"
                        color="whiteAlpha.700"
                        fontWeight="medium"
                      >
                        GROUP OWNER
                      </Text>
                      <Tooltip
                        label={DataProject.proOwnerGroupName}
                        placement="top"
                      >
                        <Text
                          fontSize="xs"
                          fontWeight="bold"
                          color="white"
                          maxW="200px"
                          isTruncated
                        >
                          {DataProject.proOwnerGroupName}
                        </Text>
                      </Tooltip>
                    </HStack>
                    <HStack justify="space-between" w="full">
                      <Text
                        fontSize="xs"
                        color="whiteAlpha.700"
                        fontWeight="medium"
                      >
                        CATEGORY
                      </Text>
                      <Badge
                        bg="whiteAlpha.200"
                        color="white"
                        size="xs"
                        px={2}
                        py={1}
                        rounded="full"
                        fontSize="xs"
                      >
                        {DataProject.projectCategory}
                      </Badge>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        )}

        <Card
          w="full"
          shadow="md"
          rounded={radiusStyle}
          border="1px"
          bgColor={colorMode === "light" ? "white" : "gray.800"}
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          transition="all 0.3s ease"
        >
          <CardHeader
            bg={colorMode === "light" ? "blue.50" : "gray.800"}
            roundedTop={radiusStyle}
            borderBottom="1px"
            borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
          >
            <HStack spacing={3}>
              <Box
                w={8}
                h={8}
                bgGradient="linear(135deg, blue.400, blue.600)"
                rounded="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiInfo size={16} color="white" />
              </Box>
              <Heading size="sm" color="blue.700">
                Project Info
              </Heading>
            </HStack>
          </CardHeader>
          <CardBody p={6}>
            <VStack spacing={4} align="stretch">
              {DataProject ? (
                <>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.600">
                      Nomor Project:
                    </Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {DataProject.projectNo}
                    </Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.600">
                      Nama Project:
                    </Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {DataProject.projectName}
                    </Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.600">
                      Karakteristik Project:
                    </Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {DataProject.projectCharasteristicName || "-"}
                    </Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.600">
                      Sub Karakteristik Project:
                    </Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {DataProject.projectSubCharasteristicName || "-"}
                    </Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.600">
                      Status Project:
                    </Text>
                    <Badge
                      size="xs"
                      colorScheme={
                        DataProject.projectStatus === "ACTIVE"
                          ? "green"
                          : DataProject.projectStatus === "ONHOLD"
                          ? "orange"
                          : DataProject.projectStatus === "COMPLETED"
                          ? "blue"
                          : "gray"
                      }
                    >
                      {DataProject.projectStatus}
                    </Badge>
                  </VStack>
                </>
              ) : (
                <LoadingMiniSignature />
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
