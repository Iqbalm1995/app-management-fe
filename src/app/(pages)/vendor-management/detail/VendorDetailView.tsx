"use client";

import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent } from "@/app/components/headerContent";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { radiusStyle, RES_CODE_OK, RES_GENERIC_ERROR_MSG } from "@/app/constants/applicationConstants";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useVendor, { VendorResponse } from "@/app/services/useVendor";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiBriefcase,
  FiGlobe,
  FiInfo,
  FiMail,
  FiMapPin,
  FiPhone,
  FiRefreshCcw,
  FiShield,
  FiTag,
  FiUser,
} from "react-icons/fi";

const VendorDetailView = () => {
  const { colorMode } = useColorMode();
  const router = useRouter();
  const searchParams = useSearchParams();
  const vendorId = searchParams.get("id");
  const showToast = useToastHelper();
  const { GetDetailById } = useVendor();

  const [tokenData, setTokenData] = useState<string>("");
  const [DataVendor, setDataVendor] = useState<VendorResponse | null>(null);
  const [IsLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) setTokenData(token);
  }, []);

  useEffect(() => {
    if (tokenData && vendorId) {
      loadVendorDetail();
    }
  }, [tokenData, vendorId]);

  const loadVendorDetail = async () => {
    setIsLoading(true);
    const response = await GetDetailById(vendorId!, tokenData);
    if (response?.statusCode === RES_CODE_OK && response.data) {
      setDataVendor(response.data);
    } else {
      showToast({ description: response?.message || RES_GENERIC_ERROR_MSG, statusToast: "error" });
    }
    setIsLoading(false);
  };

  const statusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE": return "green";
      case "INACTIVE": return "gray";
      case "BLACKLIST": return "red";
      default: return "blue";
    }
  };

  if (IsLoading) {
    return (
      <LayoutAdmin>
        <Flex justify="center" align="center" minH="400px">
          <LoadingMiniSignature />
        </Flex>
      </LayoutAdmin>
    );
  }

  if (!DataVendor) {
    return (
      <LayoutAdmin>
        <Flex justify="center" align="center" minH="400px" direction="column" gap={4}>
          <Text color="gray.500">Vendor not found</Text>
          <Button onClick={() => router.push("/vendor-management")}>Back to List</Button>
        </Flex>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      {/* Big Header Banner */}
      <Box
        bgGradient="linear(to-br, secondary.800, secondary.600)"
        color="white"
        px={{ base: 4, md: 6 }}
        py={{ base: 4, md: 6 }}
        mt={{ base: 2, md: 4 }}
        mb={{ base: 4, md: 6 }}
        rounded={radiusStyle}
        position="relative"
        overflow="hidden"
        shadow="xl"
        _before={{
          content: '""',
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          bgGradient: "linear(45deg, whiteAlpha.100 0%, transparent 50%, whiteAlpha.150 100%)",
          zIndex: 0,
        }}
      >
        {/* Logo Watermark */}
        <Box
          position="absolute"
          bottom={{ base: 2, md: 4 }}
          right={{ base: 4, md: 6 }}
          zIndex={3}
          opacity={0.7}
        >
          <Box
            as="img"
            src="/img/logo-bjb-black-wing.svg"
            alt="BJB Logo"
            w={{ base: "40px", md: "60px" }}
            h="auto"
            filter="brightness(0) invert(1)"
          />
        </Box>

        <VStack spacing={4} align="stretch" position="relative" zIndex={2}>
          {/* Top Navigation */}
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Link href="/vendor-management">
                <Button
                  leftIcon={<FiArrowLeft />}
                  variant="ghost"
                  size="sm"
                  color="white"
                  bg="whiteAlpha.100"
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  _hover={{ bg: "whiteAlpha.200", borderColor: "whiteAlpha.300", transform: "translateY(-1px)" }}
                  rounded="full"
                  px={4}
                  transition="all 0.2s ease"
                >
                  Back
                </Button>
              </Link>
            </HStack>

            <HStack spacing={2}>
              <Button
                leftIcon={<FiRefreshCcw />}
                variant="outline"
                size="sm"
                onClick={loadVendorDetail}
                isLoading={IsLoading}
                borderColor="whiteAlpha.300"
                color="white"
                bg="whiteAlpha.100"
                backdropFilter="blur(10px)"
                _hover={{ bg: "whiteAlpha.200", borderColor: "whiteAlpha.400", transform: "translateY(-1px)" }}
                rounded="full"
                px={3}
                transition="all 0.2s ease"
              >
                Refresh
              </Button>
            </HStack>
          </HStack>

          {/* Main Vendor Information */}
          <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 4, md: 6 }} align="center">
            {/* Vendor Icon */}
            <Box
              w="75px"
              h="75px"
              bgGradient="linear(to-br, secondary.100, secondary.50)"
              rounded="30%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              shadow="lg"
              color="secondary.800"
              _hover={{ transform: "scale(1.05)" }}
              transition="all 0.2s ease"
            >
              <FiBriefcase size={32} />
            </Box>

            {/* Vendor Details */}
            <Box flex={1}>
              <VStack spacing={2} align="start">
                <Heading
                  size="xl"
                  fontWeight="700"
                  bgGradient="linear(to-r, white, whiteAlpha.900)"
                  bgClip="text"
                  lineHeight="shorter"
                >
                  {DataVendor.vendorName}
                </Heading>

                <HStack spacing={3} wrap="wrap">
                  <Badge colorScheme="blue" variant="solid" px={2} rounded="full" fontSize="small" fontWeight="semibold" shadow="md">
                    {DataVendor.vendorCode}
                  </Badge>
                  <Badge colorScheme="purple" variant="solid" px={2} rounded="full" fontSize="small" fontWeight="semibold" shadow="md">
                    {DataVendor.vendorType}
                  </Badge>
                  <Badge colorScheme={statusColor(DataVendor.status)} variant="solid" px={2} rounded="full" fontSize="small" fontWeight="semibold" shadow="md">
                    {DataVendor.status}
                  </Badge>
                </HStack>

                <HStack spacing={4} fontSize="sm" opacity={0.9}>
                  <HStack spacing={1}>
                    <Icon as={FiMapPin} boxSize={3.5} />
                    <Text>{DataVendor.city}, {DataVendor.country}</Text>
                  </HStack>
                  {DataVendor.website && (
                    <HStack spacing={1}>
                      <Icon as={FiGlobe} boxSize={3.5} />
                      <Text>{DataVendor.website}</Text>
                    </HStack>
                  )}
                </HStack>
              </VStack>
            </Box>
          </Stack>
        </VStack>
      </Box>

      {/* Content Grid */}
      <Box w="full" overflow="hidden">
        <Grid templateColumns="repeat(12, 1fr)" w="full" gap={5}>
          {/* Main Content — Left */}
          <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 9 }} w="full">
            <Tabs variant="unstyled" colorScheme="secondary" size="lg">
              <Box mb={4}>
                <TabList
                  gap={2}
                  p={2}
                  overflowX="auto"
                  justifyContent="start"
                  sx={{ scrollbarWidth: "none", msOverflowStyle: "none", "&::-webkit-scrollbar": { display: "none" } }}
                >
                  <Tab
                    rounded={radiusStyle}
                    px={4}
                    py={2}
                    fontSize="sm"
                    fontWeight="600"
                    color="gray.500"
                    border="1px solid"
                    borderColor="transparent"
                    _selected={{ color: "secondary.700", bg: "secondary.50", borderColor: "secondary.200", shadow: "sm" }}
                    _hover={{ bg: colorMode === "light" ? "gray.50" : "gray.700" }}
                  >
                    <HStack spacing={2}>
                      <FiInfo size={16} />
                      <Text>Overview</Text>
                    </HStack>
                  </Tab>
                </TabList>
              </Box>

              <TabPanels>
                {/* Overview Tab */}
                <TabPanel px={0}>
                  <VStack spacing={5} align="stretch">

                    {/* Basic Information */}
                    <Card shadow="md" rounded={radiusStyle} border="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                      <CardHeader bg={colorMode === "light" ? "blue.50" : "gray.800"} roundedTop={radiusStyle} borderBottom="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.600"} py={3} px={5}>
                        <HStack spacing={3}>
                          <Box w={8} h={8} bgGradient="linear(135deg, blue.400, blue.600)" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                            <FiTag size={16} color="white" />
                          </Box>
                          <Heading size="sm" color={colorMode === "light" ? "blue.700" : "blue.300"}>Basic Information</Heading>
                        </HStack>
                      </CardHeader>
                      <CardBody px={5} py={4}>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <InfoItem label="Vendor Code" value={DataVendor.vendorCode} />
                          <InfoItem label="Vendor Name" value={DataVendor.vendorName} />
                          <InfoItem label="Vendor Type" value={DataVendor.vendorType} />
                          <InfoItem label="Website" value={DataVendor.website || "-"} />
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* Address */}
                    <Card shadow="md" rounded={radiusStyle} border="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                      <CardHeader bg={colorMode === "light" ? "green.50" : "gray.800"} roundedTop={radiusStyle} borderBottom="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.600"} py={3} px={5}>
                        <HStack spacing={3}>
                          <Box w={8} h={8} bgGradient="linear(135deg, green.400, green.600)" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                            <FiMapPin size={16} color="white" />
                          </Box>
                          <Heading size="sm" color={colorMode === "light" ? "green.700" : "green.300"}>Address</Heading>
                        </HStack>
                      </CardHeader>
                      <CardBody px={5} py={4}>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <InfoItem label="Address 1" value={DataVendor.address1} />
                          <InfoItem label="Address 2" value={DataVendor.address2 || "-"} />
                          <InfoItem label="City" value={DataVendor.city} />
                          <InfoItem label="Country" value={DataVendor.country} />
                          <InfoItem label="Postal Code" value={DataVendor.postalCode || "-"} />
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* PIC Contact */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                      <Card shadow="md" rounded={radiusStyle} border="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                        <CardHeader bg={colorMode === "light" ? "orange.50" : "gray.800"} roundedTop={radiusStyle} borderBottom="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.600"} py={3} px={5}>
                          <HStack spacing={3}>
                            <Box w={8} h={8} bgGradient="linear(135deg, orange.400, orange.600)" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                              <FiUser size={16} color="white" />
                            </Box>
                            <Heading size="sm" color={colorMode === "light" ? "orange.700" : "orange.300"}>PIC Business</Heading>
                          </HStack>
                        </CardHeader>
                        <CardBody px={5} py={4}>
                          <VStack spacing={3} align="stretch">
                            <InfoItem label="Name" value={DataVendor.picBusinessName} />
                            <InfoItem label="Email" value={DataVendor.picBusinessEmail} />
                            <InfoItem label="Hotline" value={DataVendor.picBusinessNumberHotline || "-"} />
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card shadow="md" rounded={radiusStyle} border="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                        <CardHeader bg={colorMode === "light" ? "cyan.50" : "gray.800"} roundedTop={radiusStyle} borderBottom="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.600"} py={3} px={5}>
                          <HStack spacing={3}>
                            <Box w={8} h={8} bgGradient="linear(135deg, cyan.400, cyan.600)" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                              <FiUser size={16} color="white" />
                            </Box>
                            <Heading size="sm" color={colorMode === "light" ? "cyan.700" : "cyan.300"}>PIC Technical</Heading>
                          </HStack>
                        </CardHeader>
                        <CardBody px={5} py={4}>
                          <VStack spacing={3} align="stretch">
                            <InfoItem label="Name" value={DataVendor.picTechnicalName} />
                            <InfoItem label="Email" value={DataVendor.picTechnicalEmail} />
                            <InfoItem label="Hotline" value={DataVendor.picTechnicalNumberHotline || "-"} />
                          </VStack>
                        </CardBody>
                      </Card>
                    </SimpleGrid>

                    {/* Classification */}
                    <Card shadow="md" rounded={radiusStyle} border="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                      <CardHeader bg={colorMode === "light" ? "purple.50" : "gray.800"} roundedTop={radiusStyle} borderBottom="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.600"} py={3} px={5}>
                        <HStack spacing={3}>
                          <Box w={8} h={8} bgGradient="linear(135deg, purple.400, purple.600)" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                            <FiShield size={16} color="white" />
                          </Box>
                          <Heading size="sm" color={colorMode === "light" ? "purple.700" : "purple.300"}>Classification & Impact</Heading>
                        </HStack>
                      </CardHeader>
                      <CardBody px={5} py={4}>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <InfoItem label="Dependency Level" value={DataVendor.depedencyLevel} />
                          <InfoItem label="Business Impact" value={DataVendor.businessImpact} />
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </GridItem>

          {/* Sidebar — Right */}
          <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 3 }} w="full">
            <Box w="full" flexShrink={0}>
              <VStack spacing={4}>
                {/* Vendor Info Card */}
                <Card
                  w="full"
                  shadow="lg"
                  rounded={radiusStyle}
                  border="1px"
                  bgColor={colorMode === "light" ? "white" : "gray.800"}
                  borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                  _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
                  transition="all 0.3s ease"
                >
                  <CardHeader bg={colorMode === "light" ? "blue.50" : "gray.800"} roundedTop={radiusStyle} borderBottom="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.600"} py={3} px={4}>
                    <HStack spacing={3}>
                      <Box w={7} h={7} bgGradient="linear(135deg, blue.400, blue.600)" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                        <FiInfo size={14} color="white" />
                      </Box>
                      <Heading size="xs" color={colorMode === "light" ? "blue.700" : "blue.300"}>Vendor Info</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody p={4}>
                    <VStack spacing={3} align="stretch">
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.500">Status</Text>
                        <Badge colorScheme={statusColor(DataVendor.status)} fontSize="xs">{DataVendor.status}</Badge>
                      </VStack>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.500">Dependency Level</Text>
                        <Badge colorScheme="blue" fontSize="xs">{DataVendor.depedencyLevel}</Badge>
                      </VStack>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.500">Business Impact</Text>
                        <Badge colorScheme="orange" fontSize="xs">{DataVendor.businessImpact}</Badge>
                      </VStack>
                      {DataVendor.reasonStatus && (
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" color="gray.500">Status Reason</Text>
                          <Text fontSize="xs" fontWeight="500">{DataVendor.reasonStatus}</Text>
                        </VStack>
                      )}
                      <Divider />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.500">Created At</Text>
                        <Text fontSize="xs" fontWeight="500">{new Date(DataVendor.createdAt).toLocaleDateString("id-ID")}</Text>
                      </VStack>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.500">Created By</Text>
                        <Text fontSize="xs" fontWeight="500">{DataVendor.createdBy}</Text>
                      </VStack>
                      {DataVendor.updatedAt && (
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" color="gray.500">Last Updated</Text>
                          <Text fontSize="xs" fontWeight="500">{new Date(DataVendor.updatedAt).toLocaleDateString("id-ID")}</Text>
                        </VStack>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </Box>
          </GridItem>
        </Grid>
      </Box>
    </LayoutAdmin>
  );
};

// Reusable info item
const InfoItem = ({ label, value }: { label: string; value: string }) => {
  const { colorMode } = useColorMode();
  return (
    <VStack align="start" spacing={0}>
      <Text fontSize="xs" color="gray.500">{label}</Text>
      <Text fontSize="sm" fontWeight="600" color={colorMode === "light" ? "gray.800" : "gray.100"}>
        {value || "-"}
      </Text>
    </VStack>
  );
};

export default VendorDetailView;
