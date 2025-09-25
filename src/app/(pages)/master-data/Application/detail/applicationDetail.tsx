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
  VStack,
  Divider,
  Avatar,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FiArrowLeft, FiEdit, FiSave, FiX } from "react-icons/fi";

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
    appCode: "",
    appsDesc: "",
    appsStatus: "",
  });

  // Services
  const { GetDetailById, UpdateData } = useApps();

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
        appCode: data.appCode,
        appsDesc: data.appsDesc || "",
        appsStatus: data.appsStatus,
      });
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
        appCode: formData.appCode,
        appsDesc: formData.appsDesc,
        appsStatus: formData.appsStatus,
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
  }, [tokenData, appId, LoadApplicationData]);

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
        <Grid templateColumns={{ base: "1fr", lg: "1fr 300px" }} gap={6}>
          <GridItem>
            {/* Main Content */}
            <Card shadow="sm" rounded={radiusStyle}>
              <CardHeader
                bgGradient="linear(135deg, secondary.500, secondary.600, purple.500)"
                color="white"
                p={6}
                rounded={`${radiusStyle} ${radiusStyle} 0 0`}
              >
                <Flex justify="space-between" align="center">
                  <HStack spacing={4}>
                    <Button
                      leftIcon={<FiArrowLeft />}
                      variant="ghost"
                      color="white"
                      _hover={{ bg: "whiteAlpha.200" }}
                      onClick={() => router.back()}
                    >
                      Back
                    </Button>
                    <Box>
                      <Heading size="lg" fontWeight="700">
                        {DataApplication?.appName || "Loading..."}
                      </Heading>
                      <Text fontSize="sm" opacity={0.9}>
                        Application Management
                      </Text>
                    </Box>
                  </HStack>
                  
                  <HStack spacing={2}>
                    <Badge
                      colorScheme={DataApplication?.appsStatus === "ACTIVE" ? "green" : "red"}
                      variant="solid"
                      px={3}
                      py={1}
                      rounded="full"
                    >
                      {DataApplication?.appsStatus}
                    </Badge>
                    <Text
                      fontSize="xs"
                      bg="whiteAlpha.200"
                      px={3}
                      py={1}
                      rounded="full"
                      fontFamily="mono"
                    >
                      #{DataApplication?.appCode}
                    </Text>
                  </HStack>
                </Flex>
              </CardHeader>

              <CardBody p={0}>
                <Tabs variant="enclosed" colorScheme="secondary">
                  <TabList px={6} pt={4}>
                    <Tab>Overview</Tab>
                    <Tab>Details</Tab>
                    <Tab>Settings</Tab>
                  </TabList>

                  <TabPanels>
                    {/* Overview Tab */}
                    <TabPanel p={6}>
                      <VStack spacing={6} align="stretch">
                        <Box>
                          <Heading size="md" mb={4}>Application Information</Heading>
                          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                            <Box>
                              <Text fontSize="sm" color="gray.500" mb={1}>Application Name</Text>
                              <Text fontWeight="600">{DataApplication?.appName}</Text>
                            </Box>
                            <Box>
                              <Text fontSize="sm" color="gray.500" mb={1}>Application Code</Text>
                              <Text fontWeight="600" fontFamily="mono">{DataApplication?.appCode}</Text>
                            </Box>
                          </Grid>
                        </Box>

                        <Divider />

                        <Box>
                          <Text fontSize="sm" color="gray.500" mb={2}>Description</Text>
                          <Text>{DataApplication?.appsDesc || "No description available"}</Text>
                        </Box>

                        <Divider />

                        <Box>
                          <Text fontSize="sm" color="gray.500" mb={2}>Status</Text>
                          <Badge
                            colorScheme={DataApplication?.appsStatus === "ACTIVE" ? "green" : "red"}
                            variant="subtle"
                            px={3}
                            py={1}
                            rounded="full"
                          >
                            {DataApplication?.appsStatus}
                          </Badge>
                        </Box>
                      </VStack>
                    </TabPanel>

                    {/* Details Tab */}
                    <TabPanel p={6}>
                      <VStack spacing={6} align="stretch">
                        <Flex justify="space-between" align="center">
                          <Heading size="md">Application Details</Heading>
                          <Button
                            leftIcon={IsEditMode ? <FiX /> : <FiEdit />}
                            colorScheme={IsEditMode ? "red" : "secondary"}
                            variant={IsEditMode ? "ghost" : "solid"}
                            onClick={() => setIsEditMode(!IsEditMode)}
                          >
                            {IsEditMode ? "Cancel" : "Edit"}
                          </Button>
                        </Flex>

                        <Stack spacing={4}>
                          <FormControl>
                            <FormLabel>Application Name</FormLabel>
                            <Input
                              value={formData.appName}
                              onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                              isReadOnly={!IsEditMode}
                              bg={IsEditMode ? "white" : "gray.50"}
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Application Code</FormLabel>
                            <Input
                              value={formData.appCode}
                              onChange={(e) => setFormData({ ...formData, appCode: e.target.value })}
                              isReadOnly={!IsEditMode}
                              bg={IsEditMode ? "white" : "gray.50"}
                              fontFamily="mono"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                              value={formData.appsDesc}
                              onChange={(e) => setFormData({ ...formData, appsDesc: e.target.value })}
                              isReadOnly={!IsEditMode}
                              bg={IsEditMode ? "white" : "gray.50"}
                              rows={4}
                            />
                          </FormControl>

                          {IsEditMode && (
                            <Button
                              leftIcon={<FiSave />}
                              colorScheme="secondary"
                              onClick={handleUpdate}
                              isLoading={IsLoadingProcess}
                            >
                              Save Changes
                            </Button>
                          )}
                        </Stack>
                      </VStack>
                    </TabPanel>

                    {/* Settings Tab */}
                    <TabPanel p={6}>
                      <VStack spacing={6} align="stretch">
                        <Heading size="md">Application Settings</Heading>
                        <Text color="gray.500">
                          Additional settings and configurations will be available here.
                        </Text>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            {/* Sidebar */}
            <Card shadow="sm" rounded={radiusStyle}>
              <CardHeader>
                <Heading size="sm">Quick Info</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Box textAlign="center">
                    <Avatar
                      size="xl"
                      name={DataApplication?.appName}
                      bg="secondary.100"
                      color="secondary.600"
                      mb={3}
                    />
                    <Text fontWeight="600">{DataApplication?.appName}</Text>
                    <Text fontSize="sm" color="gray.500">{DataApplication?.appCode}</Text>
                  </Box>

                  <Divider />

                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>Status</Text>
                    <Badge
                      colorScheme={DataApplication?.appsStatus === "ACTIVE" ? "green" : "red"}
                      variant="subtle"
                    >
                      {DataApplication?.appsStatus}
                    </Badge>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>Application ID</Text>
                    <Text fontSize="sm" fontFamily="mono">{appId}</Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      )}
    </LayoutAdmin>
  );
}

export default ApplicationDetail;
