"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useAuthorizeGroups, {
  AuthorizeGroupResponse,
  AuthorizeGroupUpdatePayload,
} from "@/app/services/useAuthorizeGroups";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Grid,
  GridItem,
  Heading,
  HStack,
  Text,
  VStack,
  useColorMode,
  Icon,
  Badge,
  Avatar,
  Button,
  Divider,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Switch,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import {
  FiEdit,
  FiSave,
  FiX,
  FiShield,
} from "react-icons/fi";
import { TbUsersGroup } from "react-icons/tb";

interface AuthorizeGroupFormValues {
  agCode: string;
  agName: string;
  agDescriptions: string;
  isActive: string;
  agAccessMaker: string;
  agAccessReview: string;
  agAccessApprove: string;
}

function AuthorizeGroupDetailView() {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const router = useRouter();
  const searchParams = useSearchParams();
  const agId = searchParams.get("id");

  const { GetDetailById, Update } = useAuthorizeGroups();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [AuthorizeGroupData, setAuthorizeGroupData] = useState<AuthorizeGroupResponse | null>(null);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [HeaderDataContent, setHeaderDataContent] = useState<HeaderContentProps>({
    titleName: "Authorize Group Details",
    breadCrumb: ["Home", "Master Data", "Authorize Groups", "Details"],
  });

  const ValidationSchema = Yup.object().shape({
    agName: Yup.string()
      .required("Name is required")
      .min(3, "Minimum 3 characters")
      .max(100, "Maximum 100 characters"),
    agDescriptions: Yup.string().max(500, "Maximum 500 characters"),
  });

  const formik = useFormik<AuthorizeGroupFormValues>({
    initialValues: {
      agCode: "",
      agName: "",
      agDescriptions: "",
      isActive: "1",
      agAccessMaker: "0",
      agAccessReview: "0",
      agAccessApprove: "0",
    },
    validationSchema: ValidationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      await handleUpdateAuthorizeGroup(values);
    },
  });

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

  useEffect(() => {
    if (agId && tokenData && DataAuth) {
      GetAuthorizeGroupData();
    }
  }, [agId, tokenData, DataAuth]);

  useEffect(() => {
    if (AuthorizeGroupData) {
      formik.setValues({
        agCode: AuthorizeGroupData.agCode,
        agName: AuthorizeGroupData.agName,
        agDescriptions: AuthorizeGroupData.agDescriptions || "",
        isActive: AuthorizeGroupData.isActive,
        agAccessMaker: AuthorizeGroupData.agAccessMaker,
        agAccessReview: AuthorizeGroupData.agAccessReview,
        agAccessApprove: AuthorizeGroupData.agAccessApprove,
      });
    }
  }, [AuthorizeGroupData]);

  const GetAuthorizeGroupData = async () => {
    if (!agId || !tokenData) return;

    try {
      setIsLoadingProcess(true);
      const requestData = await GetDetailById(agId, tokenData);

      if (!requestData || requestData.statusCode !== RES_CODE_OK) {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        return;
      }

      const data = requestData.data as AuthorizeGroupResponse;
      setAuthorizeGroupData(data);

      setHeaderDataContent({
        titleName: data.agName,
        breadCrumb: ["Home", "Master Data", "Authorize Groups", data.agName],
      });
    } catch (error) {
      console.error("Error fetching authorize group data:", error);
      showToast({
        description: "An unexpected error occurred",
        statusToast: "error",
      });
    } finally {
      setIsLoadingProcess(false);
    }
  };

  const handleUpdateAuthorizeGroup = async (values: AuthorizeGroupFormValues) => {
    if (!agId || !tokenData) return;

    try {
      setIsUpdating(true);

      const payload: AuthorizeGroupUpdatePayload = {
        id: agId,
        agCode: values.agCode,
        agName: values.agName,
        agDescriptions: values.agDescriptions || null,
        functionIdLink: null,
        isActive: values.isActive,
        agAccessMaker: values.agAccessMaker,
        agAccessReview: values.agAccessReview,
        agAccessApprove: values.agAccessApprove,
      };

      const response = await Update(payload, tokenData);

      if (!response || response.statusCode !== RES_CODE_OK) {
        showToast({
          description: response?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        return;
      }

      showToast({
        description: "Authorize Group updated successfully",
        statusToast: "success",
      });

      setIsEditMode(false);
      await GetAuthorizeGroupData();
    } catch (error) {
      console.error("Error updating authorize group:", error);
      showToast({
        description: "An unexpected error occurred",
        statusToast: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditMode = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (AuthorizeGroupData) {
      formik.setValues({
        agCode: AuthorizeGroupData.agCode,
        agName: AuthorizeGroupData.agName,
        agDescriptions: AuthorizeGroupData.agDescriptions || "",
        isActive: AuthorizeGroupData.isActive,
        agAccessMaker: AuthorizeGroupData.agAccessMaker,
        agAccessReview: AuthorizeGroupData.agAccessReview,
        agAccessApprove: AuthorizeGroupData.agAccessApprove,
      });
    }
  };

  if (IsLoadingProcess) {
    return (
      <LayoutAdmin>
        <HeaderContent
          titleName="Loading..."
          breadCrumb={["Home", "Master Data", "Authorize Groups", "Details"]}
        />
        <Box mx={{ base: 4, md: 6 }} mt={4}>
          <Text>Loading authorize group details...</Text>
        </Box>
      </LayoutAdmin>
    );
  }

  if (!AuthorizeGroupData) {
    return (
      <LayoutAdmin>
        <HeaderContent
          titleName="Authorize Group Not Found"
          breadCrumb={["Home", "Master Data", "Authorize Groups", "Details"]}
        />
        <Box mx={{ base: 4, md: 6 }} mt={4}>
          <Text>Authorize Group not found or error loading data.</Text>
        </Box>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      <Box mx={{ base: 4, md: 6 }} mt={4} mb={8}>
        {/* Header Card */}
        <Card
          rounded="2xl"
          overflow="hidden"
          mb={8}
          shadow="xl"
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <CardBody p={8} bg="secondary.500">
            <Button
              variant="ghost"
              leftIcon={<Icon as={FaArrowLeft} />}
              onClick={() => router.push("/master-data/authorize-groups")}
              mb={6}
              color="whiteAlpha.800"
              size="sm"
              _hover={{ bg: "whiteAlpha.200" }}
            >
              Back to Authorize Groups
            </Button>

            <HStack spacing={6} align="start" justify="space-between">
              <HStack spacing={6} align="center" flex="1">
                <Box position="relative">
                  <Avatar
                    size="2xl"
                    icon={<Icon as={TbUsersGroup} fontSize="3xl" />}
                    bg="secondary.500"
                    color="white"
                    shadow="lg"
                    border="3px solid"
                    borderColor="white"
                  />
                  <Box
                    position="absolute"
                    bottom="0"
                    right="0"
                    w="24px"
                    h="24px"
                    rounded="full"
                    bg={AuthorizeGroupData.isActive === "1" ? "green.400" : "red.400"}
                    border="3px solid"
                    borderColor={colorMode === "light" ? "white" : "gray.800"}
                    shadow="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Box w="8px" h="8px" rounded="full" bg="white" />
                  </Box>
                </Box>

                <VStack align="start" spacing={3} flex="1">
                  <VStack align="start" spacing={1}>
                    <Heading size="xl" color="white" fontWeight="bold" letterSpacing="tight">
                      {AuthorizeGroupData.agName}
                    </Heading>
                    <HStack spacing={3}>
                      <Text fontSize="md" color="whiteAlpha.800" fontWeight="medium" fontFamily="mono">
                        #{AuthorizeGroupData.agCode}
                      </Text>
                      <Badge
                        colorScheme={AuthorizeGroupData.isActive === "1" ? "green" : "red"}
                        variant="subtle"
                        px={3}
                        py={1}
                        rounded="full"
                        fontSize="xs"
                        fontWeight="semibold"
                      >
                        {AuthorizeGroupData.isActive === "1" ? "Active" : "Inactive"}
                      </Badge>
                    </HStack>
                  </VStack>

                  <HStack spacing={6} mt={2}>
                    <VStack spacing={0} align="start">
                      <HStack>
                        <Icon as={FiShield} color={AuthorizeGroupData.agAccessMaker === "1" ? "green.300" : "whiteAlpha.500"} />
                        <Text fontSize="xs" color="whiteAlpha.700" fontWeight="medium" textTransform="uppercase">
                          Maker
                        </Text>
                      </HStack>
                    </VStack>
                    <Box w="1px" h="20px" bg="whiteAlpha.300" />
                    <VStack spacing={0} align="start">
                      <HStack>
                        <Icon as={FiShield} color={AuthorizeGroupData.agAccessReview === "1" ? "green.300" : "whiteAlpha.500"} />
                        <Text fontSize="xs" color="whiteAlpha.700" fontWeight="medium" textTransform="uppercase">
                          Review
                        </Text>
                      </HStack>
                    </VStack>
                    <Box w="1px" h="20px" bg="whiteAlpha.300" />
                    <VStack spacing={0} align="start">
                      <HStack>
                        <Icon as={FiShield} color={AuthorizeGroupData.agAccessApprove === "1" ? "green.300" : "whiteAlpha.500"} />
                        <Text fontSize="xs" color="whiteAlpha.700" fontWeight="medium" textTransform="uppercase">
                          Approve
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>
                </VStack>
              </HStack>

              <VStack spacing={2} align="end">
                {!isEditMode ? (
                  <Button
                    leftIcon={<Icon as={FiEdit} />}
                    colorScheme="whiteAlpha"
                    variant="solid"
                    size="md"
                    onClick={handleEditMode}
                    shadow="md"
                  >
                    Edit
                  </Button>
                ) : (
                  <HStack>
                    <Button
                      leftIcon={<Icon as={FiSave} />}
                      colorScheme="green"
                      size="md"
                      onClick={() => formik.handleSubmit()}
                      isLoading={isUpdating}
                      shadow="md"
                    >
                      Save
                    </Button>
                    <Button
                      leftIcon={<Icon as={FiX} />}
                      colorScheme="whiteAlpha"
                      variant="outline"
                      size="md"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </HStack>
                )}
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Details Grid */}
        <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
          {/* Basic Information */}
          <GridItem>
            <Card rounded="xl" shadow="md" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
              <CardHeader pb={3}>
                <Heading size="md">Basic Information</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                      Code
                    </FormLabel>
                    {isEditMode ? (
                      <Input value={formik.values.agCode} isReadOnly bg="gray.50" />
                    ) : (
                      <Text fontWeight="medium">{AuthorizeGroupData.agCode}</Text>
                    )}
                  </FormControl>

                  <FormControl isInvalid={!!(formik.errors.agName && formik.touched.agName)}>
                    <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                      Name
                    </FormLabel>
                    {isEditMode ? (
                      <>
                        <Input
                          name="agName"
                          value={formik.values.agName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <FormErrorMessage>{formik.errors.agName}</FormErrorMessage>
                      </>
                    ) : (
                      <Text fontWeight="medium">{AuthorizeGroupData.agName}</Text>
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                      Description
                    </FormLabel>
                    {isEditMode ? (
                      <Textarea
                        name="agDescriptions"
                        value={formik.values.agDescriptions}
                        onChange={formik.handleChange}
                        rows={3}
                        maxLength={500}
                      />
                    ) : (
                      <Text>{AuthorizeGroupData.agDescriptions || "-"}</Text>
                    )}
                  </FormControl>

                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <FormLabel mb="0" fontSize="sm" fontWeight="semibold" color="gray.600">
                      Is Active
                    </FormLabel>
                    {isEditMode ? (
                      <Switch
                        isChecked={formik.values.isActive === "1"}
                        onChange={(e) => formik.setFieldValue("isActive", e.target.checked ? "1" : "0")}
                      />
                    ) : (
                      <Badge colorScheme={AuthorizeGroupData.isActive === "1" ? "green" : "red"}>
                        {AuthorizeGroupData.isActive === "1" ? "Active" : "Inactive"}
                      </Badge>
                    )}
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Access Permissions */}
          <GridItem>
            <Card rounded="xl" shadow="md" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
              <CardHeader pb={3}>
                <Heading size="md">Access Permissions</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <FormLabel mb="0" fontSize="sm" fontWeight="semibold" color="gray.600">
                      Access Maker
                    </FormLabel>
                    {isEditMode ? (
                      <Switch
                        isChecked={formik.values.agAccessMaker === "1"}
                        onChange={(e) => formik.setFieldValue("agAccessMaker", e.target.checked ? "1" : "0")}
                      />
                    ) : (
                      <Badge colorScheme={AuthorizeGroupData.agAccessMaker === "1" ? "green" : "gray"}>
                        {AuthorizeGroupData.agAccessMaker === "1" ? "Yes" : "No"}
                      </Badge>
                    )}
                  </FormControl>

                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <FormLabel mb="0" fontSize="sm" fontWeight="semibold" color="gray.600">
                      Access Review
                    </FormLabel>
                    {isEditMode ? (
                      <Switch
                        isChecked={formik.values.agAccessReview === "1"}
                        onChange={(e) => formik.setFieldValue("agAccessReview", e.target.checked ? "1" : "0")}
                      />
                    ) : (
                      <Badge colorScheme={AuthorizeGroupData.agAccessReview === "1" ? "green" : "gray"}>
                        {AuthorizeGroupData.agAccessReview === "1" ? "Yes" : "No"}
                      </Badge>
                    )}
                  </FormControl>

                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <FormLabel mb="0" fontSize="sm" fontWeight="semibold" color="gray.600">
                      Access Approve
                    </FormLabel>
                    {isEditMode ? (
                      <Switch
                        isChecked={formik.values.agAccessApprove === "1"}
                        onChange={(e) => formik.setFieldValue("agAccessApprove", e.target.checked ? "1" : "0")}
                      />
                    ) : (
                      <Badge colorScheme={AuthorizeGroupData.agAccessApprove === "1" ? "green" : "gray"}>
                        {AuthorizeGroupData.agAccessApprove === "1" ? "Yes" : "No"}
                      </Badge>
                    )}
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </Box>
    </LayoutAdmin>
  );
}

export default AuthorizeGroupDetailView;
