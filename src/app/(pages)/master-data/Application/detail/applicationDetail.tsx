"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  APP_TYPE_OPTIONS,
  APP_ENV_LOCATION_OPTIONS,
  APP_OPERATIONAL_OPTIONS,
  APP_RELATED_OPTIONS,
  APP_TRANSACTIONAL_OPTIONS,
  APP_INTEGRATED_OTHER_APPS,
  fullDay,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useApps, { ApplicationMasterResponse } from "@/app/services/useApps";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  Heading,
  Stack,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useColorMode,
  Badge,
  HStack,
  Icon,
  VStack,
  Divider,
  Avatar,
  Checkbox,
  CheckboxGroup,
  RadioGroup,
  Radio,
  Tag,
  TagLabel,
  Wrap,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FiArrowLeft, FiEdit, FiSave, FiX, FiFileText, FiSettings, FiGlobe, FiFolder, FiPlus } from "react-icons/fi";
import { WeekdaySelector } from "@/app/components/inputProps/WeekDaySelector";
import OtherInputAppsStringSeparator from "@/app/components/inputProps/InputMultiTags";
import InputTagsArea from "@/app/components/inputProps/InputMultiTagsArea";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Application Detail",
  breadCrumb: ["Master Data", "Applications", "Detail"],
};

function ApplicationDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();

  // Auth Setup
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // ID State
  const [appId, setAppId] = useState<string | null>(null);

  // Data State
  const [DataApplication, setDataApplication] = useState<ApplicationMasterResponse | null>(null);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [IsEditMode, setIsEditMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    appName: "",
    appShortName: "",
    appsDesc: "",
    note: "",
    appTargetUsers: "INTERNAL",
    appAccessFrontsiteDns: "",
    appAccessFrontsiteIp: "",
    appAccessBacksiteDns: "",
    appAccessBacksiteIp: "",
    appAccessMedia: "",
    appTypes: "",
    appTypeCustom: "",
    appRelatedness: "",
    appRelatednessDesc: "",
    appTransactionals: "",
    appOperational24hrs: "",
    appOperationalDays: "",
    appOperationalHourOpen: "",
    appOperationalHourClosed: "",
    appEnvLocations: "",
    appEnvLocationsOthers: "",
    appPrivateAuth: "Y",
    appHightAvailability: "Y",
    appIntegrationOthersApps: "",
  });

  // Conditional state for Additional Info
  const [MediaAksesPublic, setMediaAksesPublic] = useState(false);
  const [MediaAksesIntranet, setMediaAksesIntranet] = useState(false);
  const [SelectedAppsTypes, setSelectedAppsTypes] = useState<string>("");
  const [SelectedAppsEnvLoc, setSelectedAppsEnvLoc] = useState<string>("");
  const [OperationalDays, setOperationalDays] = useState<string>("");
  const hasOtherAppsTypes = SelectedAppsTypes.split(",").map(s => s.trim().toLowerCase()).includes("other");
  const hasOtherEnvLocTypes = SelectedAppsEnvLoc.split(",").map(s => s.trim().toLowerCase()).includes("other");

  // Checkbox handlers
  const handleAppysTypesCheckboxChange = (value: string) => {
    const currentList = SelectedAppsTypes.split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    let updatedList: string[];

    if (currentList.includes(value)) {
      updatedList = currentList.filter((item) => item !== value);
    } else {
      updatedList = [...currentList, value];
    }

    const newValue = updatedList.join(", ") + (updatedList.length > 0 ? "," : "");
    setSelectedAppsTypes(newValue);
    setFormData({...formData, appTypes: newValue});
  };

  const handleAppysEnvLocCheckboxChange = (value: string) => {
    const currentList = SelectedAppsEnvLoc.split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    let updatedList: string[];

    if (currentList.includes(value)) {
      updatedList = currentList.filter((item) => item !== value);
    } else {
      updatedList = [...currentList, value];
    }

    const newValue = updatedList.join(", ") + (updatedList.length > 0 ? "," : "");
    setSelectedAppsEnvLoc(newValue);
    setFormData({...formData, appEnvLocations: newValue});
  };

  const handleQuickAddTagIntegratedApps = (tag: string) => {
    const currentValue = formData.appIntegrationOthersApps || "";
    const currentTags = currentValue.split(",").map((t: string) => t.trim()).filter(Boolean);

    if (!currentTags.includes(tag)) {
      const updated = [...currentTags, tag].join(", ");
      setFormData({...formData, appIntegrationOthersApps: updated});
    }
  };

  // Sync OperationalDays with formData
  useEffect(() => {
    setFormData(prev => ({...prev, appOperationalDays: OperationalDays}));
  }, [OperationalDays]);

  // Services
  const { GetDetailById, UpdateData } = useApps();

  // Handle Save
  const handleSave = async () => {
    if (!tokenData || !appId) return;

    try {
      setIsLoadingProcess(true);
      
      const payload = {
        id: appId,
        appName: formData.appName,
        appShortName: formData.appShortName,
        appsDesc: formData.appsDesc,
        note: formData.note,
        appTargetUsers: formData.appTargetUsers,
        appAccessFrontsiteDns: formData.appAccessFrontsiteDns,
        appAccessFrontsiteIp: formData.appAccessFrontsiteIp,
        appAccessBacksiteDns: formData.appAccessBacksiteDns,
        appAccessBacksiteIp: formData.appAccessBacksiteIp,
        appAccessMedia: formData.appAccessMedia,
        appTypes: formData.appTypes,
        appTypeCustom: formData.appTypeCustom,
        appRelatedness: formData.appRelatedness,
        appRelatednessDesc: formData.appRelatednessDesc,
        appTransactionals: formData.appTransactionals,
        appOperational24hrs: formData.appOperational24hrs,
        appOperationalDays: formData.appOperationalDays,
        appOperationalHourOpen: formData.appOperationalHourOpen,
        appOperationalHourClosed: formData.appOperationalHourClosed,
        appEnvLocations: formData.appEnvLocations,
        appEnvLocationsOthers: formData.appEnvLocationsOthers,
        appPrivateAuth: formData.appPrivateAuth,
        appHightAvailability: formData.appHightAvailability,
        appIntegrationOthersApps: formData.appIntegrationOthersApps,
      };

      const requestData = await UpdateData(payload, tokenData);
      
      if (!requestData || requestData.statusCode !== RES_CODE_OK) {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        return;
      }

      // Update local state directly instead of calling loadApplicationData
      setDataApplication(prev => prev ? {
        ...prev,
        appName: formData.appName,
        appShortName: formData.appShortName,
        appsDesc: formData.appsDesc,
        note: formData.note,
        appTargetUsers: formData.appTargetUsers,
        appAccessFrontsiteDns: formData.appAccessFrontsiteDns,
        appAccessFrontsiteIp: formData.appAccessFrontsiteIp,
        appAccessBacksiteDns: formData.appAccessBacksiteDns,
        appAccessBacksiteIp: formData.appAccessBacksiteIp,
        appAccessMedia: formData.appAccessMedia,
        appTypes: formData.appTypes,
        appTypeCustom: formData.appTypeCustom,
        appRelatedness: formData.appRelatedness,
        appRelatednessDesc: formData.appRelatednessDesc,
        appTransactionals: formData.appTransactionals,
        appOperational24hrs: formData.appOperational24hrs,
        appOperationalDays: formData.appOperationalDays,
        appOperationalHourOpen: formData.appOperationalHourOpen,
        appOperationalHourClosed: formData.appOperationalHourClosed,
        appEnvLocations: formData.appEnvLocations,
        appEnvLocationsOthers: formData.appEnvLocationsOthers,
        appPrivateAuth: formData.appPrivateAuth,
        appHightAvailability: formData.appHightAvailability,
        appIntegrationOthersApps: formData.appIntegrationOthersApps,
      } : null);

      showToast({
        description: "Application updated successfully",
        statusToast: "success",
      });

      setIsEditMode(false);

    } catch (error) {
      console.error("Error updating application:", error);
      showToast({
        description: "Failed to update application",
        statusToast: "error",
      });
    } finally {
      setIsLoadingProcess(false);
    }
  };

  // ID Effect
  useEffect(() => {
    // Get the 'id' from the search params (query string)
    const id = searchParams.get("id");
    if (id) {
      setAppId(id); // Set it to the state
    }
  }, [searchParams]);

  // Auth Effect
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) setTokenData(token);
  }, [DataAuth]);

  // Load Application Data
  const LoadApplicationData = useCallback(async () => {
    if (!appId || !tokenData) return;

    try {
      setIsLoadingProcess(true);
      const requestData = await GetDetailById(appId, tokenData);

      if (!requestData || requestData.statusCode !== RES_CODE_OK) {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        return;
      }

      const data = requestData.data as ApplicationMasterResponse;
      setDataApplication(data);
      setFormData({
        appName: data.appName,
        appShortName: data.appShortName,
        appsDesc: data.appsDesc || "",
        note: data.note || "",
        appTargetUsers: data.appTargetUsers || "INTERNAL",
        appAccessFrontsiteDns: data.appAccessFrontsiteDns || "",
        appAccessFrontsiteIp: data.appAccessFrontsiteIp || "",
        appAccessBacksiteDns: data.appAccessBacksiteDns || "",
        appAccessBacksiteIp: data.appAccessBacksiteIp || "",
        appAccessMedia: data.appAccessMedia || "",
        appTypes: data.appTypes || "",
        appTypeCustom: data.appTypeCustom || "",
        appRelatedness: data.appRelatedness || "",
        appRelatednessDesc: data.appRelatednessDesc || "",
        appTransactionals: data.appTransactionals || "",
        appOperational24hrs: data.appOperational24hrs || "",
        appOperationalDays: data.appOperationalDays || "",
        appOperationalHourOpen: data.appOperationalHourOpen || "",
        appOperationalHourClosed: data.appOperationalHourClosed || "",
        appEnvLocations: data.appEnvLocations || "",
        appEnvLocationsOthers: data.appEnvLocationsOthers || "",
        appPrivateAuth: data.appPrivateAuth || "Y",
        appHightAvailability: data.appHightAvailability || "Y",
        appIntegrationOthersApps: data.appIntegrationOthersApps || "",
      });
      
      // Set conditional states
      setMediaAksesPublic(!!data.appAccessFrontsiteDns);
      setMediaAksesIntranet(!!data.appAccessBacksiteIp);
      setSelectedAppsTypes(data.appTypes || "");
      setSelectedAppsEnvLoc(data.appEnvLocations || "");
      setOperationalDays(data.appOperationalDays || "");
    } catch (error) {
      console.error("Error loading application:", error);
      showToast({
        description: "Failed to load application data",
        statusToast: "error",
      });
    } finally {
      setIsLoadingProcess(false);
    }
  }, [appId, tokenData, GetDetailById, showToast]);

  // Update Application
  const handleUpdate = async () => {
    if (!appId || !tokenData) return;

    try {
      setIsLoadingProcess(true);
      const payload = {
        id: appId,
        appName: formData.appName,
        appShortName: formData.appShortName,
        appsDesc: formData.appsDesc,
        note: formData.note,
      };

      const requestData = await UpdateData(payload, tokenData);

      if (!requestData || requestData.statusCode !== RES_CODE_OK) {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        return;
      }

      showToast({
        description: "Application updated successfully",
        statusToast: "success",
      });

      setIsEditMode(false);
      LoadApplicationData();
    } catch (error) {
      console.error("Error updating application:", error);
      showToast({
        description: "Failed to update application",
        statusToast: "error",
      });
    } finally {
      setIsLoadingProcess(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    if (tokenData && appId) {
      LoadApplicationData();
    }
  }, [tokenData, appId]); // Remove LoadApplicationData from dependencies

  if (!appId) {
    return (
      <LayoutAdmin>
        <HeaderContent {...HeaderDataContent} />
        <Card>
          <CardBody>
            <Text>Application ID not found</Text>
          </CardBody>
        </Card>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <HeaderContent {...HeaderDataContent} />
      
      {IsLoadingProcess ? (
        <LoadingMiniSignature />
      ) : (
        <Box px={{ base: 4, md: 6 }} py={4}>
          {/* Modern Header Section */}
          <Card
            shadow="2xl"
            rounded={radiusStyle}
            overflow="hidden"
            border="1px"
            borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
            mb={8}
          >
            <Box
              bgGradient="linear(135deg, secondary.400, secondary.600, purple.500)"
              position="relative"
              _before={{
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgGradient: "linear(45deg, transparent 30%, whiteAlpha.100 50%, transparent 70%)",
              }}
            >
              {/* Back Button - Edge positioned */}
              <Button
                leftIcon={<FiArrowLeft />}
                variant="ghost"
                color="white"
                size="lg"
                rounded="xl"
                position="absolute"
                top={4}
                left={4}
                zIndex={2}
                _hover={{ 
                  bg: "whiteAlpha.200",
                  transform: "translateX(-2px)"
                }}
                transition="all 0.2s"
                onClick={() => router.back()}
              >
                Back
              </Button>

              <CardHeader p={8} pt={16} position="relative">
                <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                  <HStack spacing={4}>
                    {/* Application Avatar */}
                    <Avatar
                      size="xl"
                      name={DataApplication?.appShortName || "App"}
                      bg="whiteAlpha.300"
                      color="white"
                      fontSize="2xl"
                      fontWeight="bold"
                      borderRadius={radiusStyle}
                      border="3px"
                      borderColor="whiteAlpha.400"
                    />
                    
                    <VStack align="start" spacing={1}>
                      <Heading size="lg" fontWeight="700" color="white">
                        {DataApplication?.appName || "Loading..."}
                      </Heading>
                      <HStack spacing={3}>
                        <Text fontSize="md" color="whiteAlpha.900" fontWeight="medium">
                          {DataApplication?.appShortName}
                        </Text>
                        <Badge
                          colorScheme={DataApplication?.appsStatus === "ACTIVE" ? "green" : "red"}
                          variant="solid"
                          px={4}
                          py={2}
                          rounded="full"
                          fontSize="sm"
                          fontWeight="bold"
                        >
                          {DataApplication?.appsStatus}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="whiteAlpha.800">
                        Application Management System
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <HStack spacing={3}>
                    <Button
                      leftIcon={<FiEdit />}
                      colorScheme="whiteAlpha"
                      variant="solid"
                      size="lg"
                      rounded="xl"
                      bg="whiteAlpha.200"
                      color="white"
                      _hover={{
                        bg: "whiteAlpha.300",
                        transform: "translateY(-2px)",
                        boxShadow: "xl"
                      }}
                      transition="all 0.2s"
                      onClick={() => setIsEditMode(!IsEditMode)}
                    >
                      {IsEditMode ? "Cancel" : "Edit"}
                    </Button>
                  </HStack>
                </Flex>
              </CardHeader>
            </Box>
          </Card>

          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
            <GridItem>
              {/* Main Content Card */}
              <Card
                shadow="xl"
                rounded={radiusStyle}
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "white" : "gray.800"}
              >
                <CardBody p={0}>
                  <Tabs variant="unstyled" colorScheme="secondary">
                    <TabList 
                      px={6} 
                      pt={6} 
                      pb={2}
                      bg={colorMode === "light" ? "gray.50" : "gray.700"}
                      borderBottom="1px"
                      borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                      gap={2}
                    >
                      <Tab 
                        fontWeight="semibold" 
                        px={6}
                        py={3}
                        rounded="xl"
                        color={colorMode === "light" ? "gray.600" : "gray.400"}
                        _selected={{ 
                          color: "white",
                          bg: "secondary.500",
                          boxShadow: "lg",
                          transform: "translateY(-2px)"
                        }}
                        _hover={{
                          bg: colorMode === "light" ? "gray.200" : "gray.600",
                          transform: "translateY(-1px)"
                        }}
                        transition="all 0.2s"
                      >
                        <HStack spacing={2}>
                          <Icon as={FiFileText} boxSize={4} />
                          <Text>Main Information</Text>
                        </HStack>
                      </Tab>
                      <Tab 
                        fontWeight="semibold" 
                        px={6}
                        py={3}
                        rounded="xl"
                        color={colorMode === "light" ? "gray.600" : "gray.400"}
                        _selected={{ 
                          color: "white",
                          bg: "secondary.500",
                          boxShadow: "lg",
                          transform: "translateY(-2px)"
                        }}
                        _hover={{
                          bg: colorMode === "light" ? "gray.200" : "gray.600",
                          transform: "translateY(-1px)"
                        }}
                        transition="all 0.2s"
                      >
                        <HStack spacing={2}>
                          <Icon as={FiSettings} boxSize={4} />
                          <Text>Additional Information</Text>
                        </HStack>
                      </Tab>
                      <Tab 
                        fontWeight="semibold" 
                        px={6}
                        py={3}
                        rounded="xl"
                        color={colorMode === "light" ? "gray.600" : "gray.400"}
                        _selected={{ 
                          color: "white",
                          bg: "secondary.500",
                          boxShadow: "lg",
                          transform: "translateY(-2px)"
                        }}
                        _hover={{
                          bg: colorMode === "light" ? "gray.200" : "gray.600",
                          transform: "translateY(-1px)"
                        }}
                        transition="all 0.2s"
                      >
                        <HStack spacing={2}>
                          <Icon as={FiSettings} boxSize={4} />
                          <Text>Features</Text>
                        </HStack>
                      </Tab>
                      <Tab 
                        fontWeight="semibold" 
                        px={6}
                        py={3}
                        rounded="xl"
                        color={colorMode === "light" ? "gray.600" : "gray.400"}
                        _selected={{ 
                          color: "white",
                          bg: "secondary.500",
                          boxShadow: "lg",
                          transform: "translateY(-2px)"
                        }}
                        _hover={{
                          bg: colorMode === "light" ? "gray.200" : "gray.600",
                          transform: "translateY(-1px)"
                        }}
                        transition="all 0.2s"
                      >
                        <HStack spacing={2}>
                          <Icon as={FiGlobe} boxSize={4} />
                          <Text>Environment</Text>
                        </HStack>
                      </Tab>
                      <Tab 
                        fontWeight="semibold" 
                        px={6}
                        py={3}
                        rounded="xl"
                        color={colorMode === "light" ? "gray.600" : "gray.400"}
                        _selected={{ 
                          color: "white",
                          bg: "secondary.500",
                          boxShadow: "lg",
                          transform: "translateY(-2px)"
                        }}
                        _hover={{
                          bg: colorMode === "light" ? "gray.200" : "gray.600",
                          transform: "translateY(-1px)"
                        }}
                        transition="all 0.2s"
                      >
                        <HStack spacing={2}>
                          <Icon as={FiFolder} boxSize={4} />
                          <Text>Projects</Text>
                        </HStack>
                      </Tab>
                    </TabList>

                    <TabPanels>
                      {/* Main Information Tab */}
                      <TabPanel p={8}>
                        <VStack spacing={8} align="stretch">
                          {IsEditMode && (
                            <Flex justify="end">
                              <HStack spacing={2}>
                                <Button
                                  leftIcon={<FiX />}
                                  variant="ghost"
                                  colorScheme="red"
                                  size="sm"
                                  rounded="lg"
                                  onClick={() => setIsEditMode(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  leftIcon={<FiSave />}
                                  colorScheme="secondary"
                                  size="sm"
                                  rounded="lg"
                                  isLoading={IsLoadingProcess}
                                  onClick={handleSave}
                                >
                                  Save Changes
                                </Button>
                              </HStack>
                            </Flex>
                          )}

                          {/* Basic Information */}
                          <Box>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color={colorMode === "light" ? "gray.800" : "white"}
                              mb={6}
                            >
                              Basic Information
                            </Text>
                            
                            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                              <FormControl>
                                <FormLabel
                                  fontSize="sm"
                                  fontWeight="semibold"
                                  color={colorMode === "light" ? "gray.700" : "gray.300"}
                                  mb={2}
                                >
                                  Application Name
                                </FormLabel>
                                <Input
                                  value={formData.appName}
                                  onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                                  isReadOnly={!IsEditMode}
                                  size="lg"
                                  bg={IsEditMode ? (colorMode === "light" ? "white" : "gray.700") : (colorMode === "light" ? "gray.50" : "gray.600")}
                                  border="2px"
                                  borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                                  rounded="xl"
                                  _focus={{
                                    borderColor: "secondary.500",
                                    boxShadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                                  }}
                                />
                              </FormControl>

                              <FormControl>
                                <FormLabel
                                  fontSize="sm"
                                  fontWeight="semibold"
                                  color={colorMode === "light" ? "gray.700" : "gray.300"}
                                  mb={2}
                                >
                                  Short Name
                                </FormLabel>
                                <Input
                                  value={formData.appShortName}
                                  onChange={(e) => setFormData({ ...formData, appShortName: e.target.value })}
                                  isReadOnly={!IsEditMode}
                                  size="lg"
                                  bg={IsEditMode ? (colorMode === "light" ? "white" : "gray.700") : (colorMode === "light" ? "gray.50" : "gray.600")}
                                  border="2px"
                                  borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                                  rounded="xl"
                                  _focus={{
                                    borderColor: "secondary.500",
                                    boxShadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                                  }}
                                />
                              </FormControl>
                            </Grid>
                          </Box>

                          <Divider />

                          {/* Description Section */}
                          <Box>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color={colorMode === "light" ? "gray.800" : "white"}
                              mb={6}
                            >
                              Description & Notes
                            </Text>
                            
                            <VStack spacing={6} align="stretch">
                              <FormControl>
                                <FormLabel
                                  fontSize="sm"
                                  fontWeight="semibold"
                                  color={colorMode === "light" ? "gray.700" : "gray.300"}
                                  mb={2}
                                >
                                  Description
                                </FormLabel>
                                <Textarea
                                  value={formData.appsDesc}
                                  onChange={(e) => setFormData({ ...formData, appsDesc: e.target.value })}
                                  isReadOnly={!IsEditMode}
                                  rows={4}
                                  size="lg"
                                  bg={IsEditMode ? (colorMode === "light" ? "white" : "gray.700") : (colorMode === "light" ? "gray.50" : "gray.600")}
                                  border="2px"
                                  borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                                  rounded="xl"
                                  resize="none"
                                  _focus={{
                                    borderColor: "secondary.500",
                                    boxShadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                                  }}
                                />
                              </FormControl>

                              <FormControl>
                                <FormLabel
                                  fontSize="sm"
                                  fontWeight="semibold"
                                  color={colorMode === "light" ? "gray.700" : "gray.300"}
                                  mb={2}
                                >
                                  Notes
                                </FormLabel>
                                <Textarea
                                  value={formData.note}
                                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                  isReadOnly={!IsEditMode}
                                  rows={3}
                                  size="lg"
                                  bg={IsEditMode ? (colorMode === "light" ? "white" : "gray.700") : (colorMode === "light" ? "gray.50" : "gray.600")}
                                  border="2px"
                                  borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                                  rounded="xl"
                                  resize="none"
                                  _focus={{
                                    borderColor: "secondary.500",
                                    boxShadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                                  }}
                                />
                              </FormControl>
                            </VStack>
                          </Box>
                        </VStack>
                      </TabPanel>

                      {/* Additional Information Tab */}
                      <TabPanel p={8}>
                        <VStack spacing={8} align="stretch">
                          {IsEditMode && (
                            <Flex justify="end">
                              <HStack spacing={2}>
                                <Button
                                  leftIcon={<FiX />}
                                  variant="ghost"
                                  colorScheme="red"
                                  size="sm"
                                  rounded="lg"
                                  onClick={() => setIsEditMode(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  leftIcon={<FiSave />}
                                  colorScheme="secondary"
                                  size="sm"
                                  rounded="lg"
                                  isLoading={IsLoadingProcess}
                                  onClick={handleSave}
                                >
                                  Save Changes
                                </Button>
                              </HStack>
                            </Flex>
                          )}

                          {/* Target Users */}
                          <Box>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color={colorMode === "light" ? "gray.800" : "white"}
                              mb={4}
                            >
                              Target Pengguna
                            </Text>
                            
                            <FormControl>
                              <RadioGroup
                                value={formData.appTargetUsers}
                                onChange={(val) => IsEditMode && setFormData({...formData, appTargetUsers: val})}
                                isDisabled={!IsEditMode}
                              >
                                <HStack spacing={4}>
                                  <Radio value="EXTERNAL">EXTERNAL (NASABAH)</Radio>
                                  <Radio value="INTERNAL">INTERNAL (BANK)</Radio>
                                </HStack>
                              </RadioGroup>
                            </FormControl>
                          </Box>

                          <Divider />

                          {/* Media Akses */}
                          <Box>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color={colorMode === "light" ? "gray.800" : "white"}
                              mb={4}
                            >
                              Media Akses Aplikasi
                            </Text>
                            
                            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                              <GridItem>
                                <VStack align="start" spacing={3}>
                                  <Checkbox
                                    isChecked={MediaAksesPublic}
                                    onChange={(e) => {
                                      if (IsEditMode) {
                                        setMediaAksesPublic(e.target.checked);
                                        if (!e.target.checked) {
                                          setFormData({...formData, appAccessFrontsiteDns: ""});
                                        }
                                      }
                                    }}
                                    isDisabled={!IsEditMode}
                                  >
                                    Internet (Publik)
                                  </Checkbox>
                                  {MediaAksesPublic && (
                                    <Input
                                      value={formData.appAccessFrontsiteDns}
                                      onChange={(e) => setFormData({...formData, appAccessFrontsiteDns: e.target.value})}
                                      placeholder="https://"
                                      isReadOnly={!IsEditMode}
                                      bg={IsEditMode ? (colorMode === "light" ? "white" : "gray.700") : (colorMode === "light" ? "gray.50" : "gray.600")}
                                      border="2px"
                                      borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                                      rounded="xl"
                                      cursor={IsEditMode ? "text" : "not-allowed"}
                                      opacity={IsEditMode ? 1 : 0.6}
                                    />
                                  )}
                                </VStack>
                              </GridItem>
                              <GridItem>
                                <VStack align="start" spacing={3}>
                                  <Checkbox
                                    isChecked={MediaAksesIntranet}
                                    onChange={(e) => {
                                      if (IsEditMode) {
                                        setMediaAksesIntranet(e.target.checked);
                                        if (!e.target.checked) {
                                          setFormData({...formData, appAccessBacksiteIp: ""});
                                        }
                                      }
                                    }}
                                    isDisabled={!IsEditMode}
                                  >
                                    Intranet (BackOffice)
                                  </Checkbox>
                                  {MediaAksesIntranet && (
                                    <Input
                                      value={formData.appAccessBacksiteIp}
                                      onChange={(e) => setFormData({...formData, appAccessBacksiteIp: e.target.value})}
                                      placeholder="http://"
                                      isReadOnly={!IsEditMode}
                                      bg={IsEditMode ? (colorMode === "light" ? "white" : "gray.700") : (colorMode === "light" ? "gray.50" : "gray.600")}
                                      border="2px"
                                      borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                                      rounded="xl"
                                      cursor={IsEditMode ? "text" : "not-allowed"}
                                      opacity={IsEditMode ? 1 : 0.6}
                                    />
                                  )}
                                </VStack>
                              </GridItem>
                            </Grid>
                          </Box>

                          <Divider />

                          {/* Jenis Aplikasi */}
                          <Box>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color={colorMode === "light" ? "gray.800" : "white"}
                              mb={4}
                            >
                              Jenis Aplikasi
                            </Text>
                            
                            <FormControl>
                              <Text fontSize="sm" color="gray.500" mb={2}>Base Aplikasi</Text>
                              <CheckboxGroup>
                                <Grid templateColumns="repeat(2, 1fr)" gap={1} w="full">
                                  {APP_TYPE_OPTIONS.map((item, idx) => (
                                    <GridItem
                                      key={idx}
                                      colSpan={{
                                        base: 2,
                                        sm: 2,
                                        md: 1,
                                        lg: 1,
                                      }}
                                      w="full"
                                    >
                                      <Checkbox
                                        isChecked={SelectedAppsTypes.includes(item)}
                                        onChange={() => IsEditMode && handleAppysTypesCheckboxChange(item)}
                                        isDisabled={!IsEditMode}
                                      >
                                        {item}
                                      </Checkbox>
                                    </GridItem>
                                  ))}
                                </Grid>
                              </CheckboxGroup>
                              {hasOtherAppsTypes && (
                                <VStack align="start" spacing={2} mt={3}>
                                  <Text fontSize="sm">Jenis lainnya</Text>
                                  <Box pointerEvents={IsEditMode ? "auto" : "none"} opacity={IsEditMode ? 1 : 0.6} w="full">
                                    <OtherInputAppsStringSeparator
                                      value={formData.appTypeCustom || ""}
                                      onChange={(val) => setFormData({...formData, appTypeCustom: val})}
                                    />
                                  </Box>
                                </VStack>
                              )}
                            </FormControl>
                          </Box>

                          <Divider />

                          {/* Keterkaitan & Kategori */}
                          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                            <GridItem>
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color={colorMode === "light" ? "gray.800" : "white"}
                                mb={4}
                              >
                                Keterkaitan Aplikasi
                              </Text>
                              <FormControl>
                                <RadioGroup
                                  value={formData.appRelatedness}
                                  onChange={(val) => {
                                    if (IsEditMode) {
                                      setFormData({...formData, appRelatedness: val});
                                      if (val !== "REGULATOR") {
                                        setFormData(prev => ({...prev, appRelatednessDesc: ""}));
                                      }
                                    }
                                  }}
                                  isDisabled={!IsEditMode}
                                >
                                  <HStack spacing={4}>
                                    {APP_RELATED_OPTIONS.map((item, idx) => (
                                      <Radio key={idx} value={item}>
                                        {item}
                                      </Radio>
                                    ))}
                                  </HStack>
                                </RadioGroup>
                                {formData.appRelatedness === "REGULATOR" && (
                                  <VStack align="start" spacing={2} mt={3}>
                                    <Text fontSize="sm">Nama Regulator</Text>
                                    <Box pointerEvents={IsEditMode ? "auto" : "none"} opacity={IsEditMode ? 1 : 0.6} w="full">
                                      <OtherInputAppsStringSeparator
                                        value={formData.appRelatednessDesc || ""}
                                        onChange={(val) => setFormData({...formData, appRelatednessDesc: val})}
                                      />
                                    </Box>
                                  </VStack>
                                )}
                              </FormControl>
                            </GridItem>
                            <GridItem>
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color={colorMode === "light" ? "gray.800" : "white"}
                                mb={4}
                              >
                                Kategori Aplikasi
                              </Text>
                              <FormControl>
                                <RadioGroup
                                  value={formData.appTransactionals}
                                  onChange={(val) => IsEditMode && setFormData({...formData, appTransactionals: val})}
                                  isDisabled={!IsEditMode}
                                >
                                  <HStack spacing={4}>
                                    {APP_TRANSACTIONAL_OPTIONS.map((item, idx) => (
                                      <Radio key={idx} value={item}>
                                        {item}
                                      </Radio>
                                    ))}
                                  </HStack>
                                </RadioGroup>
                              </FormControl>
                            </GridItem>
                          </Grid>

                          <Divider />

                          {/* Waktu Operasional */}
                          <Box>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color={colorMode === "light" ? "gray.800" : "white"}
                              mb={4}
                            >
                              Waktu Operasional Aplikasi
                            </Text>
                            
                            <FormControl mb={4}>
                              <RadioGroup
                                value={formData.appOperational24hrs}
                                onChange={(val) => {
                                  if (IsEditMode) {
                                    if (val === APP_OPERATIONAL_OPTIONS[0]) {
                                      setFormData({
                                        ...formData,
                                        appOperational24hrs: val,
                                        appOperationalHourOpen: "",
                                        appOperationalHourClosed: ""
                                      });
                                      setOperationalDays(fullDay.join(", "));
                                    } else {
                                      setFormData({
                                        ...formData,
                                        appOperational24hrs: val
                                      });
                                      setOperationalDays("");
                                    }
                                  }
                                }}
                                isDisabled={!IsEditMode}
                              >
                                <HStack spacing={4}>
                                  {APP_OPERATIONAL_OPTIONS.map((item, idx) => (
                                    <Radio key={idx} value={item}>
                                      {item}
                                    </Radio>
                                  ))}
                                </HStack>
                              </RadioGroup>
                            </FormControl>

                            {formData.appOperational24hrs === APP_OPERATIONAL_OPTIONS[1] && (
                              <VStack spacing={4} align="stretch">
                                <FormControl>
                                  <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.500">Pilih Hari</FormLabel>
                                  <Box pointerEvents={IsEditMode ? "auto" : "none"} opacity={IsEditMode ? 1 : 0.6}>
                                    <WeekdaySelector
                                      value={OperationalDays}
                                      onChange={setOperationalDays}
                                    />
                                  </Box>
                                </FormControl>
                                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                  <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.500">Operasional Mulai</FormLabel>
                                    <Input
                                      type="time"
                                      value={formData.appOperationalHourOpen}
                                      onChange={(e) => setFormData({...formData, appOperationalHourOpen: e.target.value})}
                                      isReadOnly={!IsEditMode}
                                      bg={IsEditMode ? (colorMode === "light" ? "white" : "gray.700") : (colorMode === "light" ? "gray.50" : "gray.600")}
                                      border="2px"
                                      borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                                      rounded="xl"
                                      cursor={IsEditMode ? "text" : "not-allowed"}
                                      opacity={IsEditMode ? 1 : 0.6}
                                    />
                                  </FormControl>
                                  <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.500">Operasional Selesai</FormLabel>
                                    <Input
                                      type="time"
                                      value={formData.appOperationalHourClosed}
                                      onChange={(e) => setFormData({...formData, appOperationalHourClosed: e.target.value})}
                                      isReadOnly={!IsEditMode}
                                      bg={IsEditMode ? (colorMode === "light" ? "white" : "gray.700") : (colorMode === "light" ? "gray.50" : "gray.600")}
                                      border="2px"
                                      borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                                      rounded="xl"
                                      cursor={IsEditMode ? "text" : "not-allowed"}
                                      opacity={IsEditMode ? 1 : 0.6}
                                    />
                                  </FormControl>
                                </Grid>
                              </VStack>
                            )}
                          </Box>

                          <Divider />

                          {/* Technical Information */}
                          <Box>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color={colorMode === "light" ? "gray.800" : "white"}
                              mb={4}
                            >
                              Informasi Teknis
                            </Text>
                            
                            <VStack spacing={4} align="stretch">
                              <FormControl>
                                <FormLabel fontSize="sm" fontWeight="semibold">Target Lokasi Server</FormLabel>
                                <CheckboxGroup>
                                  <Grid templateColumns="repeat(2, 1fr)" gap={1} w="full">
                                    {APP_ENV_LOCATION_OPTIONS.map((item, idx) => (
                                      <GridItem
                                        key={idx}
                                        colSpan={{
                                          base: 2,
                                          sm: 2,
                                          md: 1,
                                          lg: 1,
                                        }}
                                        w="full"
                                      >
                                        <Checkbox
                                          isChecked={SelectedAppsEnvLoc.includes(item)}
                                          onChange={() => IsEditMode && handleAppysEnvLocCheckboxChange(item)}
                                          isDisabled={!IsEditMode}
                                        >
                                          {item}
                                        </Checkbox>
                                      </GridItem>
                                    ))}
                                  </Grid>
                                </CheckboxGroup>
                                {hasOtherEnvLocTypes && (
                                  <VStack align="start" spacing={2} mt={3}>
                                    <Text fontSize="sm">Input Lainnya</Text>
                                    <Box pointerEvents={IsEditMode ? "auto" : "none"} opacity={IsEditMode ? 1 : 0.6} w="full">
                                      <OtherInputAppsStringSeparator
                                        value={formData.appEnvLocationsOthers || ""}
                                        onChange={(val) => setFormData({...formData, appEnvLocationsOthers: val})}
                                      />
                                    </Box>
                                  </VStack>
                                )}
                              </FormControl>

                              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                <FormControl>
                                  <FormLabel fontSize="sm" fontWeight="semibold">Otentikasi UIM</FormLabel>
                                  <RadioGroup
                                    value={formData.appPrivateAuth}
                                    onChange={(val) => IsEditMode && setFormData({...formData, appPrivateAuth: val})}
                                    isDisabled={!IsEditMode}
                                  >
                                    <HStack spacing={4}>
                                      <Radio value="Y">Ya</Radio>
                                      <Radio value="N">Tidak</Radio>
                                    </HStack>
                                  </RadioGroup>
                                </FormControl>

                                <FormControl>
                                  <FormLabel fontSize="sm" fontWeight="semibold">High Availability</FormLabel>
                                  <RadioGroup
                                    value={formData.appHightAvailability}
                                    onChange={(val) => IsEditMode && setFormData({...formData, appHightAvailability: val})}
                                    isDisabled={!IsEditMode}
                                  >
                                    <HStack spacing={4}>
                                      <Radio value="Y">Ya</Radio>
                                      <Radio value="N">Tidak</Radio>
                                    </HStack>
                                  </RadioGroup>
                                </FormControl>
                              </Grid>

                              <FormControl>
                                <FormLabel fontSize="sm" fontWeight="semibold">Integrasi Dengan Aplikasi Lain</FormLabel>
                                <Box pointerEvents={IsEditMode ? "auto" : "none"} opacity={IsEditMode ? 1 : 0.6}>
                                  <InputTagsArea
                                    name="appIntegrationOthersApps"
                                    value={formData.appIntegrationOthersApps || ""}
                                    onChange={(val) => setFormData({...formData, appIntegrationOthersApps: val})}
                                  />
                                </Box>
                                {IsEditMode && (
                                  <>
                                    <Divider my={3} />
                                    <Text fontSize="sm" fontWeight="semibold" mb={2}>Tambah Cepat</Text>
                                    <Text fontSize="xs" color="gray.500" mb={2}>Rekomendasi Aplikasi Lain / Surrounding</Text>
                                    <Wrap spacing={2}>
                                      {APP_INTEGRATED_OTHER_APPS.filter((item) => {
                                        const existingTags = (formData.appIntegrationOthersApps || "")
                                          .split(",")
                                          .map((t: string) => t.trim());
                                        return !existingTags.includes(item);
                                      }).map((item, index) => (
                                        <Tag
                                          key={index}
                                          borderRadius="full"
                                          colorScheme="secondary"
                                          variant="solid"
                                          px={3}
                                          cursor="pointer"
                                          _hover={{
                                            bg: "secondary.700",
                                            color: "white",
                                          }}
                                          onClick={() => handleQuickAddTagIntegratedApps(item)}
                                        >
                                          <Icon as={FiPlus} mr={1} />
                                          <TagLabel>{item}</TagLabel>
                                        </Tag>
                                      ))}
                                    </Wrap>
                                  </>
                                )}
                              </FormControl>
                            </VStack>
                          </Box>
                        </VStack>
                      </TabPanel>

                      {/* Features Tab */}
                      <TabPanel p={8}>
                        <VStack spacing={8} align="center" justify="center" minH="500px">
                          <Box
                            p={12}
                            bg={colorMode === "light" ? "white" : "gray.800"}
                            rounded="3xl"
                            border="3px dashed"
                            borderColor="secondary.300"
                            textAlign="center"
                            maxW="500px"
                            position="relative"
                            _before={{
                              content: '""',
                              position: "absolute",
                              top: "-2px",
                              left: "-2px",
                              right: "-2px",
                              bottom: "-2px",
                              bgGradient: "linear(45deg, secondary.400, purple.400, secondary.400)",
                              rounded: "3xl",
                              zIndex: -1,
                              opacity: 0.1,
                            }}
                          >
                            <Box
                              w={20}
                              h={20}
                              bg="secondary.100"
                              rounded="full"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              mx="auto"
                              mb={6}
                            >
                              <Icon as={FiSettings} boxSize={10} color="secondary.600" />
                            </Box>
                            <Text fontSize="2xl" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "white"} mb={4}>
                              Features Management
                            </Text>
                            <Text color={colorMode === "light" ? "gray.600" : "gray.400"} fontSize="lg" lineHeight="tall">
                              Application features and capabilities will be managed here. Configure feature flags, permissions, and functionality modules.
                            </Text>
                            <Badge colorScheme="secondary" variant="subtle" mt={4} px={4} py={2} rounded="full">
                              Coming Soon
                            </Badge>
                          </Box>
                        </VStack>
                      </TabPanel>

                      {/* Environment Tab */}
                      <TabPanel p={8}>
                        <VStack spacing={8} align="center" justify="center" minH="500px">
                          <Box
                            p={12}
                            bg={colorMode === "light" ? "white" : "gray.800"}
                            rounded="3xl"
                            border="3px dashed"
                            borderColor="green.300"
                            textAlign="center"
                            maxW="500px"
                            position="relative"
                            _before={{
                              content: '""',
                              position: "absolute",
                              top: "-2px",
                              left: "-2px",
                              right: "-2px",
                              bottom: "-2px",
                              bgGradient: "linear(45deg, green.400, teal.400, green.400)",
                              rounded: "3xl",
                              zIndex: -1,
                              opacity: 0.1,
                            }}
                          >
                            <Box
                              w={20}
                              h={20}
                              bg="green.100"
                              rounded="full"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              mx="auto"
                              mb={6}
                            >
                              <Icon as={FiGlobe} boxSize={10} color="green.600" />
                            </Box>
                            <Text fontSize="2xl" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "white"} mb={4}>
                              Environment Configuration
                            </Text>
                            <Text color={colorMode === "light" ? "gray.600" : "gray.400"} fontSize="lg" lineHeight="tall">
                              Manage development, staging, and production environments. Configure deployment settings and environment variables.
                            </Text>
                            <Badge colorScheme="green" variant="subtle" mt={4} px={4} py={2} rounded="full">
                              Coming Soon
                            </Badge>
                          </Box>
                        </VStack>
                      </TabPanel>

                      {/* Project Attached Tab */}
                      <TabPanel p={8}>
                        <VStack spacing={8} align="center" justify="center" minH="500px">
                          <Box
                            p={12}
                            bg={colorMode === "light" ? "white" : "gray.800"}
                            rounded="3xl"
                            border="3px dashed"
                            borderColor="blue.300"
                            textAlign="center"
                            maxW="500px"
                            position="relative"
                            _before={{
                              content: '""',
                              position: "absolute",
                              top: "-2px",
                              left: "-2px",
                              right: "-2px",
                              bottom: "-2px",
                              bgGradient: "linear(45deg, blue.400, cyan.400, blue.400)",
                              rounded: "3xl",
                              zIndex: -1,
                              opacity: 0.1,
                            }}
                          >
                            <Box
                              w={20}
                              h={20}
                              bg="blue.100"
                              rounded="full"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              mx="auto"
                              mb={6}
                            >
                              <Icon as={FiFolder} boxSize={10} color="blue.600" />
                            </Box>
                            <Text fontSize="2xl" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "white"} mb={4}>
                              Attached Projects
                            </Text>
                            <Text color={colorMode === "light" ? "gray.600" : "gray.400"} fontSize="lg" lineHeight="tall">
                              View and manage all projects associated with this application. Track project status and relationships.
                            </Text>
                            <Badge colorScheme="blue" variant="subtle" mt={4} px={4} py={2} rounded="full">
                              Coming Soon
                            </Badge>
                          </Box>
                        </VStack>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </CardBody>
              </Card>
            </GridItem>

            <GridItem>
              {/* Sidebar Information */}
              <VStack spacing={6} align="stretch">
                {/* Quick Stats Card */}
                <Card
                  shadow="lg"
                  rounded={radiusStyle}
                  border="1px"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                  bg={colorMode === "light" ? "white" : "gray.800"}
                >
                  <CardHeader
                    bg={colorMode === "light" ? "gray.50" : "gray.700"}
                    borderBottom="1px"
                    borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                    p={4}
                  >
                    <Text fontSize="lg" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "white"}>
                      Quick Info
                    </Text>
                  </CardHeader>
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                          App Code
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold" color={colorMode === "light" ? "gray.800" : "white"}>
                          {DataApplication?.appCode || "-"}
                        </Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                          Status
                        </Text>
                        <Badge
                          colorScheme={DataApplication?.appsStatus === "ACTIVE" ? "green" : "red"}
                          variant="subtle"
                          px={2}
                          py={1}
                          rounded="md"
                          fontSize="xs"
                        >
                          {DataApplication?.appsStatus}
                        </Badge>
                      </HStack>

                      <HStack justify="space-between">
                        <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                          Created
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold" color={colorMode === "light" ? "gray.800" : "white"}>
                          {DataApplication?.createdAt ? new Date(DataApplication.createdAt).toLocaleDateString() : "-"}
                        </Text>
                      </HStack>

                      <HStack justify="space-between">
                        <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                          Updated
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold" color={colorMode === "light" ? "gray.800" : "white"}>
                          {DataApplication?.updatedAt ? new Date(DataApplication.updatedAt).toLocaleDateString() : "-"}
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Project Stats Card */}
                <Card
                  shadow="lg"
                  rounded={radiusStyle}
                  border="1px"
                  borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                  bg={colorMode === "light" ? "white" : "gray.800"}
                >
                  <CardHeader
                    bg={colorMode === "light" ? "gray.50" : "gray.700"}
                    borderBottom="1px"
                    borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                    p={4}
                  >
                    <Text fontSize="lg" fontWeight="bold" color={colorMode === "light" ? "gray.800" : "white"}>
                      Project Statistics
                    </Text>
                  </CardHeader>
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                          Total Projects
                        </Text>
                        <Badge colorScheme="blue" variant="subtle" px={3} py={1} rounded="full">
                          {DataApplication?.countProjectAll || 0}
                        </Badge>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                          Completed
                        </Text>
                        <Badge colorScheme="green" variant="subtle" px={3} py={1} rounded="full">
                          {DataApplication?.countProjectCompleted || 0}
                        </Badge>
                      </HStack>

                      <HStack justify="space-between">
                        <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                          Ongoing
                        </Text>
                        <Badge colorScheme="orange" variant="subtle" px={3} py={1} rounded="full">
                          {DataApplication?.countProjectOnGoing || 0}
                        </Badge>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </GridItem>
          </Grid>
        </Box>
      )}
    </LayoutAdmin>
  );
}

export default ApplicationDetail;
