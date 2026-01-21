"use client";

import {
  Box,
  Button,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Progress,
  useColorMode,
} from "@chakra-ui/react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import {
  radiusStyle,
  PROJECT_TYPE_INTERNAL_DEVELOPMENT,
  PROJECT_TYPE_PROCUREMENT,
} from "@/app/constants/applicationConstants";
import { ProjectDataResponse, AppsResponse } from "@/app/services/useProjects";
import { calculateDurationInDays } from "@/app/helper/MasterHelper";
import LoadingMiniSquare from "@/app/components/loadingMiniSquare";
import { MdSettings } from "react-icons/md";
import { TbContract } from "react-icons/tb";
import { FaCode } from "react-icons/fa";

const PROJECT_ROUTES = {
  [PROJECT_TYPE_INTERNAL_DEVELOPMENT]: {
    back: "/projects-manager",
  },
  [PROJECT_TYPE_PROCUREMENT]: {
    back: "/projects-procurements",
  },
};

interface ProjectPreviewHeaderProps {
  DataProject: ProjectDataResponse | null;
  DataApps: AppsResponse | null;
  projectId: string | null;
  IsLoadingProcess: boolean;
}

export const ProjectPreviewHeader = ({
  DataProject,
  DataApps,
  projectId,
  IsLoadingProcess,
}: ProjectPreviewHeaderProps) => {
  const { colorMode } = useColorMode();

  const routeConfig = DataProject?.projectType
    ? PROJECT_ROUTES[DataProject.projectType as keyof typeof PROJECT_ROUTES]
    : PROJECT_ROUTES[PROJECT_TYPE_PROCUREMENT];

  const backUrl = routeConfig?.back || "/projects-procurements";

  const renderIcon = () => {
    if (DataProject?.projectType === PROJECT_TYPE_INTERNAL_DEVELOPMENT) {
      return <FaCode size={28} />;
    } else if (DataProject?.projectType === PROJECT_TYPE_PROCUREMENT) {
      return <TbContract size={28} />;
    }
    return <MdSettings size={28} />;
  };

  return (
    <Box
      bgGradient={"linear(to-br, secondary.600, secondary.400)"}
      color="white"
      px={{ base: 4, md: 6 }}
      py={{ base: 4, md: 5 }}
      mt={{ base: 2, md: 4 }}
      mb={{ base: 4, md: 6 }}
      rounded={radiusStyle}
      position="relative"
      overflow="hidden"
      shadow="lg"
    >
      <Box
        position="absolute"
        bottom={{ base: 2, md: 4 }}
        right={{ base: 4, md: 6 }}
        zIndex={3}
        opacity={0.5}
      >
        <Box
          as="img"
          src="/img/logo-bjb-black-wing.svg"
          alt="BJB Logo"
          w={{ base: "40px", md: "50px" }}
          h="auto"
          filter="brightness(0) invert(1)"
        />
      </Box>

      <VStack spacing={4} align="stretch" position="relative" zIndex={2}>
        <HStack justify="space-between" align="center">
          <Link href={backUrl}>
            <Button
              leftIcon={<FiArrowLeft />}
              variant="ghost"
              color="white"
              size="sm"
              _hover={{ bg: "whiteAlpha.200" }}
            >
              Back
            </Button>
          </Link>
        </HStack>

        {IsLoadingProcess ? (
          <Box py={4}>
            <LoadingMiniSquare />
          </Box>
        ) : DataProject ? (
          <VStack spacing={3} align="stretch">
            <HStack spacing={4} align="center">
              <Box
                p={3}
                bg="whiteAlpha.200"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {renderIcon()}
              </Box>
              <VStack align="start" spacing={1} flex={1}>
                <HStack>
                  <Heading size="lg" color="white">
                    {DataProject.projectName}
                  </Heading>
                  <Badge
                    colorScheme={
                      DataProject.projectStatus === "RUNNING"
                        ? "green"
                        : DataProject.projectStatus === "COMPLETED"
                        ? "blue"
                        : DataProject.projectStatus === "ONHOLD"
                        ? "orange"
                        : "gray"
                    }
                    fontSize="sm"
                  >
                    {DataProject.projectStatus}
                  </Badge>
                </HStack>
                <Text fontSize="sm" color="whiteAlpha.800">
                  {DataProject.projectCode} • {DataProject.projectCategory}
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={6} fontSize="sm">
              <VStack align="start" spacing={0}>
                <Text color="whiteAlpha.700" fontSize="xs">
                  Duration
                </Text>
                <Text fontWeight="semibold">
                  {calculateDurationInDays(
                    DataProject.projectRegisterDate || "",
                    DataProject.projectClosedDate || ""
                  )}{" "}
                  days
                </Text>
              </VStack>
              <VStack align="start" spacing={0}>
                <Text color="whiteAlpha.700" fontSize="xs">
                  Progress
                </Text>
                <HStack>
                  <Text fontWeight="semibold">
                    {DataProject.projectStatusPercentage}%
                  </Text>
                  <Progress
                    value={DataProject.projectStatusPercentage}
                    size="sm"
                    colorScheme="green"
                    w="100px"
                    rounded="full"
                    bg="whiteAlpha.300"
                  />
                </HStack>
              </VStack>
            </HStack>
          </VStack>
        ) : null}
      </VStack>
    </Box>
  );
};
