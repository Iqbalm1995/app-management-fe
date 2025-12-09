"use client";

import {
  Box,
  Button,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Avatar,
  Grid,
  useColorMode,
} from "@chakra-ui/react";
import Link from "next/link";
import { FiArrowLeft, FiHeart, FiShare, FiRefreshCcw } from "react-icons/fi";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { ProjectDataResponse } from "@/app/services/useProjects";

interface EnhancedHeaderProps {
  DataProject: ProjectDataResponse | null;
  IsLoadingProcess: boolean;
  onRefresh: () => void;
}

export const EnhancedHeader = ({
  DataProject,
  IsLoadingProcess,
  onRefresh,
}: EnhancedHeaderProps) => {
  const { colorMode } = useColorMode();

  return (
    <Box
      position="relative"
      overflow="hidden"
      rounded={radiusStyle}
      shadow="xl"
      border="1px"
      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
      mt={{ base: 2, md: 4 }}
      mb={6}
    >
      {/* Gradient Background */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient={
          colorMode === "light"
            ? "linear(135deg, secondary.500, secondary.700, secondary.800)"
            : "linear(135deg, secondary.600, secondary.800, secondary.900)"
        }
        opacity={0.9}
      />

      {/* Content */}
      <Box position="relative" zIndex={1} color="white">
        <VStack spacing={3} align="stretch" p={{ base: 4, md: 6 }}>
          {/* Top Navigation */}
          <HStack justify="space-between" align="center">
            <Link href={"/projects-procurements"}>
              <Button
                leftIcon={<FiArrowLeft />}
                variant="solid"
                size="sm"
                bg="whiteAlpha.200"
                color="white"
                _hover={{ bg: "whiteAlpha.300" }}
                backdropFilter="blur(10px)"
                border="1px"
                borderColor="whiteAlpha.300"
                rounded="full"
              >
                Back
              </Button>
            </Link>

            <HStack spacing={2}>
              <Button
                leftIcon={<FiHeart />}
                variant="ghost"
                size="sm"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                rounded="full"
              >
                Favorite
              </Button>
              <Button
                leftIcon={<FiShare />}
                variant="ghost"
                size="sm"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                rounded="full"
              >
                Share
              </Button>
              <Button
                leftIcon={<FiRefreshCcw />}
                variant="solid"
                size="sm"
                bg="whiteAlpha.200"
                color="white"
                _hover={{ bg: "whiteAlpha.300" }}
                backdropFilter="blur(10px)"
                border="1px"
                borderColor="whiteAlpha.300"
                onClick={onRefresh}
                isLoading={IsLoadingProcess}
                rounded="full"
              >
                Refresh
              </Button>
            </HStack>
          </HStack>

          {/* Project Information */}
          {DataProject ? (
            <Grid
              templateColumns={{ base: "1fr", lg: "1fr auto" }}
              gap={6}
              alignItems="center"
            >
              {/* Project Details */}
              <VStack spacing={3} align="start">
                {/* Project Avatar & Title */}
                <HStack spacing={4} align="center">
                  <Avatar
                    size="md"
                    name={
                      DataProject.appsProject?.appName ||
                      DataProject.projectName
                    }
                    bg="whiteAlpha.300"
                    color="white"
                    fontWeight="bold"
                    border="2px"
                    borderColor="whiteAlpha.400"
                  />
                  <VStack spacing={1} align="start">
                    <Heading
                      size="lg"
                      fontWeight="700"
                      color="white"
                      lineHeight="shorter"
                    >
                      {DataProject.projectName}
                    </Heading>
                    <Text fontSize="md" color="whiteAlpha.800" fontWeight="500">
                      {DataProject.appsProject?.appName ||
                        "Application Management"}
                    </Text>
                  </VStack>
                </HStack>

                {/* Badges & Info */}
                <HStack spacing={3} wrap="wrap">
                  <Badge
                    colorScheme={
                      DataProject.projectStatus === "ACTIVE"
                        ? "green"
                        : DataProject.projectStatus === "ONHOLD"
                        ? "orange"
                        : DataProject.projectStatus === "COMPLETED"
                        ? "blue"
                        : "gray"
                    }
                    px={3}
                    py={1}
                    rounded="full"
                    fontSize="sm"
                    fontWeight="600"
                    variant="solid"
                  >
                    {DataProject.projectStatus}
                  </Badge>
                  <Badge
                    bg="whiteAlpha.300"
                    color="white"
                    px={3}
                    py={1}
                    rounded="full"
                    fontSize="sm"
                    fontWeight="600"
                    border="1px"
                    borderColor="whiteAlpha.400"
                  >
                    {DataProject.projectType}
                  </Badge>
                  <HStack spacing={2}>
                    <Text fontSize="sm" color="whiteAlpha.800" fontWeight="500">
                      Project Number:
                    </Text>
                    <Text fontSize="sm" color="white" fontWeight="600">
                      {DataProject.projectNo}
                    </Text>
                  </HStack>
                </HStack>
              </VStack>

            </Grid>
          ) : (
            <Box textAlign="center" py={8}>
              <Text fontSize="lg" color="whiteAlpha.800">
                Loading project information...
              </Text>
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
};
