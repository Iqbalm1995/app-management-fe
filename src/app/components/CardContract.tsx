"use client";

import { VendorContractResponse } from "@/app/services/useVendor";
import { radiusStyle } from "@/app/constants/applicationConstants";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import {
  FiBriefcase,
  FiCalendar,
  FiClock,
  FiFileText,
  FiLayers,
  FiDollarSign,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

interface CardContractProps {
  data: VendorContractResponse;
  showWorkValue?: boolean;
}

export const formatIDR = (value: number, showValue: boolean = true) => {
  if (!showValue) return "Rp ••••••••••";
  if (value === undefined || value === null) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

export interface ContractDeadlineInfo {
  daysRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean; // within 30 days
  badgeColor: string;
  badgeLabel: string;
  warningMessage?: string;
}

export const getContractDeadlineStatus = (endDateStr?: string | null): ContractDeadlineInfo => {
  if (!endDateStr) {
    return {
      daysRemaining: 0,
      isExpired: false,
      isExpiringSoon: false,
      badgeColor: "gray",
      badgeLabel: "ACTIVE",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(endDateStr);
  endDate.setHours(0, 0, 0, 0);

  const diffTime = endDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    const expiredDays = Math.abs(daysRemaining);
    return {
      daysRemaining,
      isExpired: true,
      isExpiringSoon: false,
      badgeColor: "red",
      badgeLabel: `EXPIRED (${expiredDays}d ago)`,
      warningMessage: `This contract expired ${expiredDays} day(s) ago on ${new Date(endDateStr).toLocaleDateString("id-ID")}. Immediate action or extension required!`,
    };
  }

  if (daysRemaining <= 30) {
    return {
      daysRemaining,
      isExpired: false,
      isExpiringSoon: true,
      badgeColor: "orange",
      badgeLabel: `EXPIRING SOON (${daysRemaining}d left)`,
      warningMessage: `Contract Expiration Warning: This contract will expire in ${daysRemaining} day(s) on ${new Date(endDateStr).toLocaleDateString("id-ID")}. 1-month notice active.`,
    };
  }

  return {
    daysRemaining,
    isExpired: false,
    isExpiringSoon: false,
    badgeColor: "teal",
    badgeLabel: `ACTIVE (${daysRemaining}d left)`,
  };
};

const CardContract = ({ data, showWorkValue = false }: CardContractProps) => {
  const { colorMode } = useColorMode();
  const deadline = getContractDeadlineStatus(data.contractEndDate);

  return (
    <Card
      rounded={radiusStyle}
      shadow="lg"
      border="1px"
      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
      bg={colorMode === "light" ? "white" : "gray.800"}
      overflow="hidden"
      transition="all 0.25s ease"
      _hover={{
        transform: "translateY(-4px)",
        shadow: "xl",
        borderColor: "secondary.500",
      }}
      h="full"
      display="flex"
      flexDirection="column"
    >
      {/* Header Banner */}
      <CardHeader
        bg={colorMode === "light" ? "gray.50" : "gray.900"}
        borderBottom="1px"
        borderColor={colorMode === "light" ? "gray.100" : "gray.700"}
        py={3.5}
        px={5}
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
          <HStack spacing={2}>
            <Box
              w={7}
              h={7}
              bgGradient="linear(135deg, secondary.500, secondary.700)"
              rounded="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
            >
              <FiFileText size={14} />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color="gray.500" fontWeight="600">
                SPK / Corp Ref
              </Text>
              <Text fontSize="xs" fontWeight="700" color="secondary.700" noOfLines={1}>
                {data.corpNumber || data.contractNumber}
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={1.5}>
            {deadline.isExpiringSoon && (
              <Badge colorScheme="orange" variant="solid" rounded="full" px={2} py={0.5} fontSize="2xs" fontWeight="bold">
                1-MO NOTICE
              </Badge>
            )}
            <Badge
              colorScheme={deadline.badgeColor}
              variant="solid"
              rounded="full"
              px={2.5}
              py={0.5}
              fontSize="2xs"
              fontWeight="bold"
            >
              {deadline.badgeLabel}
            </Badge>
          </HStack>
        </Flex>
      </CardHeader>

      <CardBody p={5} flex={1} display="flex" flexDirection="column" justifyContent="space-between">
        <VStack spacing={4} align="stretch">
          {/* Title */}
          <VStack align="start" spacing={1}>
            <Text fontSize="xs" color={colorMode === "light" ? "secondary.700" : "secondary.300"} fontWeight="500">
              Vendor: <strong>{data.vendorName || data.vendorId || "-"}</strong> {data.vendorCode ? `(${data.vendorCode})` : ""}
            </Text>
            <Heading
              size="sm"
              color={colorMode === "light" ? "gray.800" : "white"}
              fontWeight="700"
              lineHeight="snug"
              noOfLines={2}
            >
              {data.corpName}
            </Heading>
            <HStack spacing={1.5} fontSize="xs" color="gray.500">
              <Icon as={FiBriefcase} boxSize={3.5} color="secondary.500" />
              <Text fontWeight="500" noOfLines={1}>
                Contract No: {data.contractNumber}
              </Text>
            </HStack>
          </VStack>

          {/* Work Value Highlight */}
          <Box
            p={3}
            bg={colorMode === "light" ? "secondary.50" : "gray.700"}
            rounded="lg"
            border="1px"
            borderColor={colorMode === "light" ? "secondary.100" : "gray.600"}
          >
            <VStack align="start" spacing={0}>
              <Text fontSize="2xs" color="gray.500" fontWeight="600" textTransform="uppercase">
                Total Work Value
              </Text>
              <Text fontSize="md" fontWeight="800" color="secondary.700">
                {formatIDR(data.workValue, showWorkValue)}
              </Text>
            </VStack>
          </Box>

          {/* Timeline & Metadata */}
          <VStack spacing={2} align="stretch" fontSize="xs">
            <HStack justify="space-between" color="gray.600">
              <HStack spacing={1}>
                <Icon as={FiCalendar} boxSize={3.5} color="blue.500" />
                <Text color="gray.500">Contract Period:</Text>
              </HStack>
              <Text fontWeight="600">
                {new Date(data.contractStartDate).toLocaleDateString("id-ID")} - {new Date(data.contractEndDate).toLocaleDateString("id-ID")}
              </Text>
            </HStack>

            <HStack justify="space-between" color="gray.600">
              <HStack spacing={1}>
                <Icon as={FiLayers} boxSize={3.5} color="teal.500" />
                <Text color="gray.500">TOP Payment Milestones:</Text>
              </HStack>
              <Badge colorScheme="teal" fontSize="2xs" rounded="md" px={2} py={0.5}>
                {data.topList?.length || 0} Steps
              </Badge>
            </HStack>
          </VStack>
        </VStack>

        {/* Action Button Footer */}
        <VStack spacing={3} align="stretch" mt={4}>
          <Divider borderColor={colorMode === "light" ? "gray.100" : "gray.700"} />
          <HStack justify="space-between" align="center">
            <Text fontSize="2xs" color={deadline.isExpired ? "red.500" : deadline.isExpiringSoon ? "orange.500" : "gray.400"} fontWeight="700">
              {deadline.isExpired
                ? `Expired ${Math.abs(deadline.daysRemaining)}d ago`
                : deadline.isExpiringSoon
                ? `Expires in ${deadline.daysRemaining} days`
                : `Valid (${deadline.daysRemaining}d remaining)`}
            </Text>
            <Link href={`/vendor-management/contracts/detail?id=${data.id}`}>
              <Button
                size="xs"
                colorScheme="blue"
                bg="secondary.500"
                _hover={{ bg: "secondary.600" }}
                leftIcon={<FiEye />}
                rounded="md"
              >
                View Contract Detail
              </Button>
            </Link>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default CardContract;
