"use client";

import React from "react";
import Link from "next/link";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Flex,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  Tooltip,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import {
  FiActivity,
  FiArrowRight,
  FiBriefcase,
  FiExternalLink,
  FiFolder,
  FiLayers,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import { HiOutlineDesktopComputer } from "react-icons/hi";
import { ApplicationMasterResponse } from "@/app/services/useApps";
import { StatusBadge } from "@/app/components/StatusBadge";
import { radiusStyle } from "@/app/constants/applicationConstants";

interface ApplicationCardProps {
  app: ApplicationMasterResponse;
}

export default function ApplicationCard({ app }: ApplicationCardProps) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const isCritical =
    app.appIsCritical?.toUpperCase() === "Y" ||
    app.appIsCritical?.toUpperCase() === "TRUE" ||
    app.appIsCritical === "1";

  const bgCard = isDark ? "gray.800" : "white";
  const borderColor = isDark ? "gray.700" : "gray.200";
  const hoverBorderColor = isDark ? "blue.400" : "blue.500";
  const metaLabelColor = isDark ? "gray.400" : "gray.500";
  const metaValueColor = isDark ? "gray.200" : "gray.800";

  return (
    <Card
      bg={bgCard}
      border="1px solid"
      borderColor={borderColor}
      borderRadius={radiusStyle}
      overflow="hidden"
      boxShadow="sm"
      transition="all 0.2s ease-in-out"
      _hover={{
        borderColor: hoverBorderColor,
        boxShadow: "md",
        transform: "translateY(-2px)",
      }}
      display="flex"
      flexDirection="column"
      h="full"
    >
      {/* Card Header */}
      <CardHeader pb={2} pt={4} px={5}>
        <Flex justify="space-between" align="start" gap={3}>
          <HStack spacing={3} align="center" flex={1} minW={0}>
            <Avatar
              size="md"
              name={app.appShortName || app.appName || "APP"}
              src={app.iconApps || undefined}
              bg={isCritical ? "red.600" : "blue.600"}
              color="white"
              icon={<HiOutlineDesktopComputer fontSize="1.5rem" />}
              borderRadius="md"
            />
            <VStack align="start" spacing={0} flex={1} minW={0}>
              <HStack spacing={2} maxW="full">
                <Text
                  fontWeight="bold"
                  fontSize="md"
                  noOfLines={1}
                  title={app.appName}
                  color={isDark ? "white" : "gray.900"}
                >
                  {app.appName}
                </Text>
              </HStack>
              <HStack spacing={2}>
                <Badge
                  fontSize="2xs"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  colorScheme="blue"
                  variant="subtle"
                >
                  {app.appCode || "NO CODE"}
                </Badge>
                {app.appShortName && (
                  <Text fontSize="xs" fontWeight="semibold" color={metaLabelColor}>
                    ({app.appShortName})
                  </Text>
                )}
              </HStack>
            </VStack>
          </HStack>
          <StatusBadge status={app.appsStatus || "ACTIVE"} fontSize="xs" />
        </Flex>
      </CardHeader>

      {/* Card Body */}
      <CardBody py={3} px={5} flex={1} display="flex" flexDirection="column" gap={3}>
        {/* Badges & Criticality */}
        <HStack spacing={2} wrap="wrap">
          <Badge
            colorScheme={isCritical ? "red" : "gray"}
            variant={isCritical ? "solid" : "subtle"}
            fontSize="2xs"
            px={2}
            py={0.5}
            borderRadius="md"
            display="flex"
            alignItems="center"
            gap={1}
          >
            <Icon as={FiShield} />
            {isCritical
              ? `Critical ${app.appCriticalLevel ? `(${app.appCriticalLevel})` : ""}`
              : "Non-Critical"}
          </Badge>

          {app.appTypes && (
            <Badge
              colorScheme="purple"
              variant="outline"
              fontSize="2xs"
              px={2}
              py={0.5}
              borderRadius="md"
            >
              {app.appTypes}
            </Badge>
          )}

          {app.appTargetUsers && (
            <Badge
              colorScheme="teal"
              variant="outline"
              fontSize="2xs"
              px={2}
              py={0.5}
              borderRadius="md"
            >
              {app.appTargetUsers}
            </Badge>
          )}
        </HStack>

        {/* Description */}
        <Text
          fontSize="xs"
          color={isDark ? "gray.300" : "gray.600"}
          noOfLines={2}
          minH="32px"
        >
          {app.appsDesc || "No system description provided."}
        </Text>

        <Divider borderColor={borderColor} />

        {/* Metadata Details Grid */}
        <SimpleGrid columns={2} spacing={2} fontSize="xs">
          <Box>
            <Text color={metaLabelColor} fontSize="2xs" fontWeight="medium">
              Managed By Group
            </Text>
            <Text
              fontWeight="semibold"
              color={metaValueColor}
              noOfLines={1}
              title={app.appManageByGroupName || "-"}
            >
              {app.appManageByGroupName || app.appManageByGroupCode || "—"}
            </Text>
          </Box>

          <Box>
            <Text color={metaLabelColor} fontSize="2xs" fontWeight="medium">
              Business Owner
            </Text>
            <Text
              fontWeight="semibold"
              color={metaValueColor}
              noOfLines={1}
              title={app.appBusinessOwnerDivisionName || "-"}
            >
              {app.appBusinessOwnerDivisionName || "—"}
            </Text>
          </Box>

          <Box>
            <Text color={metaLabelColor} fontSize="2xs" fontWeight="medium">
              PIC Contact
            </Text>
            <Text
              fontWeight="semibold"
              color={metaValueColor}
              noOfLines={1}
              title={app.appManagePicName || "-"}
            >
              {app.appManagePicName || "—"}
            </Text>
          </Box>

          <Box>
            <Text color={metaLabelColor} fontSize="2xs" fontWeight="medium">
              Connected Projects
            </Text>
            <HStack spacing={1}>
              <Icon as={FiFolder} color="blue.500" />
              <Text fontWeight="semibold" color={metaValueColor}>
                {app.countProjectAll ?? 0} Project{(app.countProjectAll || 0) === 1 ? "" : "s"}
              </Text>
            </HStack>
          </Box>
        </SimpleGrid>
      </CardBody>

      {/* Card Footer */}
      <CardFooter pt={2} pb={4} px={5} bg={isDark ? "gray.900" : "gray.50"} borderTop="1px solid" borderColor={borderColor}>
        <Button
          as={Link}
          href={`/master-data/Application/detail?id=${app.id}`}
          size="sm"
          w="full"
          colorScheme="blue"
          variant="outline"
          rightIcon={<FiArrowRight />}
          _hover={{
            bg: "blue.500",
            color: "white",
            borderColor: "blue.500",
          }}
        >
          View Application Detail
        </Button>
      </CardFooter>
    </Card>
  );
}
