"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useTeams, { TeamInsertPayload } from "@/app/services/useTeams";
import useOrganization, {
  OrganizationResponse,
} from "@/app/services/useOrganization";
import {
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  radiusStyle,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Textarea,
  Text,
  VStack,
  useColorMode,
  Icon,
  Badge,
  InputGroup,
  InputLeftElement,
  Switch,
  Divider,
  Avatar,
  Center,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { FaUsersRays, FaArrowLeft, FaImage } from "react-icons/fa6";
import { FiCode, FiUsers } from "react-icons/fi";
import * as Yup from "yup";

const HeaderDataContent: HeaderContentProps = {
  titleName: `Add New Team`,
  breadCrumb: ["Home", "Teams Center", "Add Team"],
};

function AddTeamViewPage() {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const router = useRouter();
  const { InsertTeams } = useTeams();
  const { List: ListOrganizations } = useOrganization();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth setup (REQUIRED)
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Form state
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [DirectorateData, setDirectorateData] = useState<OrganizationResponse[]>([]);
  const [GroupData, setGroupData] = useState<OrganizationResponse[]>([]);
  const [DivisionData, setDivisionData] = useState<OrganizationResponse[]>([]);
  const [selectedDirectorate, setSelectedDirectorate] = useState<string>("");
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [directorateSearch, setDirectorateSearch] = useState<string>("");
  const [divisionSearch, setDivisionSearch] = useState<string>("");
  const [groupSearch, setGroupSearch] = useState<string>("");
  const [showDirectorateOptions, setShowDirectorateOptions] = useState<boolean>(false);
  const [showDivisionOptions, setShowDivisionOptions] = useState<boolean>(false);
  const [showGroupOptions, setShowGroupOptions] = useState<boolean>(false);

  // File upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Auth effect (COPY EXACTLY)
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);

  // Load organization data
  useEffect(() => {
    const loadOrganizationData = async () => {
      if (!tokenData || !DataAuth) return;

      try {
        // Load Directorates
        const PayloadDirectorate = {
          search: "",
          limit: 999999,
          page: 0,
          fieldOrder: ["orgName"],
          orderDir: "asc",
          filterWhere: [{ field: "orgType", operator: "=", value: "DIRECTORATE" }],
        };

        const directorateResponse = await ListOrganizations(PayloadDirectorate as any, tokenData);
        if (directorateResponse?.statusCode === RES_CODE_OK && directorateResponse.data) {
          const directorates = directorateResponse.data as OrganizationResponse[];
          setDirectorateData(directorates);
        }

        // Load Divisions
        const PayloadDivision = {
          search: "",
          limit: 999999,
          page: 0,
          fieldOrder: ["orgName"],
          orderDir: "asc",
          filterWhere: [{ field: "orgType", operator: "=", value: "DIVISION" }],
        };

        const divisionResponse = await ListOrganizations(PayloadDivision as any, tokenData);
        if (divisionResponse?.statusCode === RES_CODE_OK && divisionResponse.data) {
          const divisions = divisionResponse.data as OrganizationResponse[];
          setDivisionData(divisions);
        }

        // Load Groups
        const PayloadGroup = {
          search: "",
          limit: 999999,
          page: 0,
          fieldOrder: ["orgName"],
          orderDir: "asc",
          filterWhere: [{ field: "orgType", operator: "=", value: "GROUP" }],
        };

        const groupResponse = await ListOrganizations(PayloadGroup as any, tokenData);
        if (groupResponse?.statusCode === RES_CODE_OK && groupResponse.data) {
          const groups = groupResponse.data as OrganizationResponse[];
          setGroupData(groups);
        }
      } catch (error) {
        console.error("Error loading organization data:", error);
        showToast({
          description: "Failed to load organization data",
          statusToast: "error",
        });
      }
    };

    if (DataAuth && tokenData) {
      loadOrganizationData();
    }
  }, [DataAuth, tokenData]);

  // Reset division and group when directorate changes
  useEffect(() => {
    if (selectedDirectorate !== "") {
      setSelectedDivision("");
      setDivisionSearch("");
      setGroupSearch("");
    }
  }, [selectedDirectorate]);

  // Reset group when division changes
  useEffect(() => {
    if (selectedDivision !== "") {
      setGroupSearch("");
    }
  }, [selectedDivision]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // File handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast({
          description: "Please select an image file",
          statusToast: "error",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast({
          description: "File size must be less than 5MB",
          statusToast: "error",
        });
        return;
      }

      setSelectedImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = removeFile; // Alias for existing sidebar

  // Form validation following service hook structure
  const ValidationSchema = Yup.object().shape({
    teamName: Yup.string()
      .required("Team name is required")
      .min(3, "Team name must be at least 3 characters")
      .max(100, "Team name must not exceed 100 characters"),
    teamCode: Yup.string()
      .required("Team code is required")
      .min(2, "Team code must be at least 2 characters")
      .max(10, "Team code must not exceed 10 characters")
      .matches(
        /^[A-Z0-9_-]+$/,
        "Team code must contain only uppercase letters, numbers, hyphens, and underscores"
      ),
    teamDesc: Yup.string()
      .nullable()
      .max(500, "Description must not exceed 500 characters"),
    orgGroupId: Yup.string().required("Organization group is required"),
    isActive: Yup.string().required("Status is required"),
  });

  const formik = useFormik<TeamInsertPayload>({
    initialValues: {
      teamName: "",
      teamCode: "",
      teamDesc: null,
      orgGroupId: "",
      orgGroupCode: "",
      isActive: "ACTIVE",
      uploadPict: null,
    },
    validationSchema: ValidationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      await handleSubmit(values);
    },
  });

  const handleSubmit = async (values: TeamInsertPayload) => {
    if (!tokenData || !DataAuth) {
      showToast({
        description: "Authentication required",
        statusToast: "error",
      });
      return;
    }

    // Validate required fields
    if (!values.teamName.trim()) {
      showToast({
        description: "Team name is required",
        statusToast: "error",
      });
      return;
    }

    if (!values.orgGroupId) {
      showToast({
        description: "Organization group is required",
        statusToast: "error",
      });
      return;
    }

    try {
      setIsLoadingProcess(true);


      // Find selected organization to get the code
      const selectedOrg = GroupData.find((org) => org.id === values.orgGroupId);

      if (!selectedOrg) {
        showToast({
          description: "Selected organization group not found",
          statusToast: "error",
        });
        return;
      }

      // Ensure no null/undefined values
      if (!values.teamCode?.trim()) {
        showToast({
          description: "Initial Team is required",
          statusToast: "error",
        });
        return;
      }

      if (!selectedOrg?.orgCode?.trim()) {
        showToast({
          description: "Organization code is missing",
          statusToast: "error",
        });
        return;
      }

      const payload: TeamInsertPayload = {
        teamCode: values.teamCode.trim(),
        teamName: values.teamName.trim(),
        teamDesc: values.teamDesc?.trim() || null,
        isActive: values.isActive,
        uploadPict: selectedImage,
        orgGroupId: values.orgGroupId,
        orgGroupCode: selectedOrg.orgCode.trim(),
      };


      const response = await InsertTeams(payload, tokenData);

      if (!response || response.statusCode !== RES_CODE_OK) {
        showToast({
          description: response?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        return;
      }

      showToast({
        description: "Team created successfully",
        statusToast: "success",
      });

      // Navigate back to teams list
      router.push("/teams-center");
    } catch (error) {
      console.error("Error creating team:", error);
      showToast({
        description: "An unexpected error occurred",
        statusToast: "error",
      });
    } finally {
      setIsLoadingProcess(false);
    }
  };

  // Handle image upload
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast({
          description: "Image size must be less than 5MB",
          statusToast: "error",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        showToast({
          description: "Please select a valid image file",
          statusToast: "error",
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      <Box mx={{ base: 4, md: 6 }} mt={4} mb={8}>
        {/* Back Button */}
        <Button
          variant="ghost"
          leftIcon={<Icon as={FaArrowLeft} />}
          onClick={() => router.push("/teams-center")}
          mb={6}
          color={colorMode === "light" ? "gray.600" : "gray.400"}
        >
          Back to Teams
        </Button>

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
          {/* Main Form */}
          <GridItem>
            <Card
              rounded={radiusStyle}
              shadow="lg"
              border="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
              bg={colorMode === "light" ? "white" : "gray.800"}
            >
              <CardBody p={8}>
                <VStack spacing={4} align="stretch">
                  {/* Header */}
                  <HStack spacing={3} mb={2}>
                    <Box p={2} bg="secondary.500" rounded="full" color="white">
                      <Icon as={FiUsers} boxSize={5} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Heading
                        size="md"
                        color={colorMode === "light" ? "gray.800" : "white"}
                      >
                        Create New Team
                      </Heading>
                      <Text
                        fontSize="sm"
                        color={colorMode === "light" ? "gray.600" : "gray.400"}
                      >
                        Fill in the details to create a new team
                      </Text>
                    </VStack>
                  </HStack>

                  <Divider />

                  <form onSubmit={formik.handleSubmit}>
                    <VStack spacing={6} align="stretch">
                      {/* Basic Information Card */}
                      <Card
                        bg={colorMode === "light" ? "gray.50" : "gray.700"}
                        border="1px"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                        rounded="xl"
                        shadow="sm"
                      >
                        <CardBody p={6}>
                          <VStack spacing={4} align="stretch">
                            <Heading
                              size="md"
                              color={colorMode === "light" ? "gray.800" : "white"}
                            >
                              Basic Information
                            </Heading>

                            <FormControl
                              isInvalid={!!(formik.errors.teamName && formik.touched.teamName)}
                            >
                              <FormLabel fontWeight="semibold">
                                Team Name <Text as="span" color="red.500">*</Text>
                              </FormLabel>
                              <InputGroup>
                                <InputLeftElement>
                                  <Icon as={FiUsers} color="gray.400" />
                                </InputLeftElement>
                                <Input
                                  name="teamName"
                                  value={formik.values.teamName}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  placeholder="Enter team name"
                                  size="lg"
                                  rounded="xl"
                                  bg={colorMode === "light" ? "white" : "gray.800"}
                                  border="1px"
                                  borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                                  _focus={{
                                    borderColor: "secondary.500",
                                    bg: colorMode === "light" ? "white" : "gray.800",
                                    shadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                                  }}
                                />
                              </InputGroup>
                              <FormErrorMessage>{formik.errors.teamName}</FormErrorMessage>
                            </FormControl>

                            <FormControl
                              isInvalid={!!(formik.errors.teamCode && formik.touched.teamCode)}
                            >
                              <FormLabel fontWeight="semibold">
                                Initial Team <Text as="span" color="red.500">*</Text>
                              </FormLabel>
                              <InputGroup>
                                <InputLeftElement>
                                  <Icon as={FiCode} color="gray.400" />
                                </InputLeftElement>
                                <Input
                                  name="teamCode"
                                  value={formik.values.teamCode}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  placeholder="Place your initial team"
                                  size="lg"
                                  rounded="xl"
                                  bg={colorMode === "light" ? "white" : "gray.800"}
                                  border="1px"
                                  borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                                  _focus={{
                                    borderColor: "secondary.500",
                                    bg: colorMode === "light" ? "white" : "gray.800",
                                    shadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                                  }}
                                  textTransform="uppercase"
                                  maxLength={10}
                                />
                              </InputGroup>
                              <FormErrorMessage>{formik.errors.teamCode}</FormErrorMessage>
                            </FormControl>

                            <FormControl
                              isInvalid={!!(formik.errors.teamDesc && formik.touched.teamDesc)}
                            >
                              <FormLabel fontWeight="semibold">Description</FormLabel>
                              <Textarea
                                name="teamDesc"
                                value={formik.values.teamDesc || ""}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Describe the team's purpose and responsibilities..."
                                rows={4}
                                rounded="xl"
                                resize="none"
                                bg={colorMode === "light" ? "white" : "gray.800"}
                                border="1px"
                                borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                                _focus={{
                                  borderColor: "secondary.500",
                                  bg: colorMode === "light" ? "white" : "gray.800",
                                  shadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                                }}
                              />
                              <FormErrorMessage>{formik.errors.teamDesc}</FormErrorMessage>
                            </FormControl>
                          </VStack>
                        </CardBody>
                      </Card>

                      {/* Organization Card */}
                      <Card
                        bg={colorMode === "light" ? "gray.50" : "gray.700"}
                        border="1px"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                        rounded="xl"
                        shadow="sm"
                      >
                        <CardBody p={6}>
                          <VStack spacing={4} align="stretch">
                            <Heading
                              size="md"
                              color={colorMode === "light" ? "gray.800" : "white"}
                            >
                              Organization
                            </Heading>

                            {/* Directorate Selection */}
                            <FormControl>
                              <FormLabel fontWeight="semibold">Directorate</FormLabel>
                              <Input
                                value={directorateSearch}
                                onChange={(e) => {
                                  setDirectorateSearch(e.target.value);
                                  setShowDirectorateOptions(true);
                                }}
                                onFocus={() => setShowDirectorateOptions(true)}
                                onBlur={() => setTimeout(() => setShowDirectorateOptions(false), 200)}
                                placeholder="Type to search or click to browse directorate..."
                                size="lg"
                                bg={colorMode === "light" ? "gray.50" : "gray.700"}
                                border="2px"
                                borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                                rounded="xl"
                                _hover={{ borderColor: "secondary.400" }}
                                _focus={{
                                  bg: colorMode === "light" ? "white" : "gray.800",
                                  shadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                                }}
                              />
                              {showDirectorateOptions && (
                                <Box
                                  mt={1}
                                  maxH="200px"
                                  overflowY="auto"
                                  border="1px"
                                  borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                                  rounded="md"
                                  bg={colorMode === "light" ? "white" : "gray.800"}
                                >
                                  {DirectorateData.filter(
                                    (dir) =>
                                      !directorateSearch ||
                                      dir.orgName.toLowerCase().includes(directorateSearch.toLowerCase()) ||
                                      dir.orgCode.toLowerCase().includes(directorateSearch.toLowerCase())
                                  ).map((org) => (
                                    <Box
                                      key={org.id}
                                      p={2}
                                      cursor="pointer"
                                      _hover={{
                                        bg: colorMode === "light" ? "gray.100" : "gray.700",
                                      }}
                                      onClick={() => {
                                        setSelectedDirectorate(org.id);
                                        setDirectorateSearch(`${org.orgName} (${org.orgCode})`);
                                        setSelectedDivision("");
                                        setDivisionSearch("");
                                        setGroupSearch("");
                                        setShowDirectorateOptions(false);
                                        setShowDivisionOptions(false);
                                        setShowGroupOptions(false);
                                        formik.setFieldValue("orgGroupId", "");
                                      }}
                                    >
                                      {org.orgName} ({org.orgCode})
                                    </Box>
                                  ))}
                                </Box>
                              )}
                            </FormControl>

                            {/* Division Selection */}
                            <FormControl>
                              <FormLabel fontWeight="semibold">Division</FormLabel>
                              <Input
                                value={divisionSearch}
                                onChange={(e) => {
                                  setDivisionSearch(e.target.value);
                                  setShowDivisionOptions(true);
                                }}
                                onFocus={() => setShowDivisionOptions(true)}
                                onBlur={() => setTimeout(() => setShowDivisionOptions(false), 200)}
                                placeholder="Type to search or click to browse division..."
                                size="lg"
                                rounded="xl"
                                bg={colorMode === "light" ? "white" : "gray.800"}
                                border="1px"
                                borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                                _focus={{
                                  borderColor: "secondary.500",
                                  bg: colorMode === "light" ? "white" : "gray.800",
                                  shadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                                }}
                              />
                              {showDivisionOptions && (
                                <Box
                                  mt={1}
                                  maxH="200px"
                                  overflowY="auto"
                                  border="1px"
                                  borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                                  rounded="md"
                                  bg={colorMode === "light" ? "white" : "gray.800"}
                                >
                                  {DivisionData.filter((division) => {
                                    const matchesDirectorate = selectedDirectorate
                                      ? division.parentId === selectedDirectorate
                                      : true;
                                    const matchesSearch =
                                      !divisionSearch ||
                                      division.orgName.toLowerCase().includes(divisionSearch.toLowerCase()) ||
                                      division.orgCode.toLowerCase().includes(divisionSearch.toLowerCase());
                                    return matchesSearch && matchesDirectorate;
                                  }).map((division) => (
                                    <Box
                                      key={division.id}
                                      p={2}
                                      cursor="pointer"
                                      _hover={{
                                        bg: colorMode === "light" ? "gray.100" : "gray.700",
                                      }}
                                      onClick={() => {
                                        setSelectedDivision(division.id);
                                        setDivisionSearch(`${division.orgName} (${division.orgCode})`);
                                        setGroupSearch("");
                                        setShowDivisionOptions(false);
                                        setShowGroupOptions(false);
                                        formik.setFieldValue("orgGroupId", "");
                                      }}
                                    >
                                      {division.orgName} ({division.orgCode})
                                    </Box>
                                  ))}
                                </Box>
                              )}
                            </FormControl>

                            {/* Group Selection */}
                            <FormControl
                              isInvalid={!!(formik.errors.orgGroupId && formik.touched.orgGroupId)}
                            >
                              <FormLabel fontWeight="semibold">
                                Organization Group <Text as="span" color="red.500">*</Text>
                              </FormLabel>
                              <Input
                                value={groupSearch}
                                onChange={(e) => {
                                  setGroupSearch(e.target.value);
                                  setShowGroupOptions(true);
                                }}
                                onFocus={() => setShowGroupOptions(true)}
                                onBlur={() => setTimeout(() => setShowGroupOptions(false), 200)}
                                placeholder="Type to search or click to browse group..."
                                size="lg"
                                rounded="xl"
                                bg={colorMode === "light" ? "white" : "gray.800"}
                                border="1px"
                                borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                                _focus={{
                                  borderColor: "secondary.500",
                                  bg: colorMode === "light" ? "white" : "gray.800",
                                  shadow: "0 0 0 1px var(--chakra-colors-secondary-500)",
                                }}
                              />
                              {showGroupOptions && (
                                <Box
                                  mt={1}
                                  maxH="200px"
                                  overflowY="auto"
                                  border="1px"
                                  borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                                  rounded="md"
                                  bg={colorMode === "light" ? "white" : "gray.800"}
                                >
                                  {GroupData.filter((group) => {
                                    const matchesDivision = selectedDivision
                                      ? group.parentId === selectedDivision
                                      : false;
                                    const matchesSearch =
                                      !groupSearch ||
                                      group.orgName.toLowerCase().includes(groupSearch.toLowerCase()) ||
                                      group.orgCode.toLowerCase().includes(groupSearch.toLowerCase());
                                    return matchesSearch && matchesDivision;
                                  }).map((org) => (
                                    <Box
                                      key={org.id}
                                      p={2}
                                      cursor="pointer"
                                      _hover={{
                                        bg: colorMode === "light" ? "gray.100" : "gray.700",
                                      }}
                                      onClick={() => {
                                        setGroupSearch(`${org.orgName} (${org.orgCode})`);
                                        setShowGroupOptions(false);
                                        formik.setFieldValue("orgGroupId", org.id);
                                      }}
                                    >
                                      {org.orgName} ({org.orgCode})
                                    </Box>
                                  ))}
                                </Box>
                              )}
                              <FormErrorMessage>{formik.errors.orgGroupId}</FormErrorMessage>
                            </FormControl>
                          </VStack>
                        </CardBody>
                      </Card>

                      {/* Status Card */}
                      <Card
                        bg={colorMode === "light" ? "gray.50" : "gray.700"}
                        border="1px"
                        borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                        rounded="xl"
                        shadow="sm"
                      >
                        <CardBody p={6}>
                          <VStack spacing={4} align="stretch">
                            <Heading
                              size="md"
                              color={colorMode === "light" ? "gray.800" : "white"}
                            >
                              Status
                            </Heading>

                            <FormControl>
                              <FormLabel fontWeight="semibold">Team Status</FormLabel>
                              <HStack spacing={4}>
                                <Switch
                                  name="isActive"
                                  isChecked={formik.values.isActive === "ACTIVE"}
                                  onChange={(e) =>
                                    formik.setFieldValue(
                                      "isActive",
                                      e.target.checked ? "ACTIVE" : "INACTIVE"
                                    )
                                  }
                                  colorScheme="green"
                                  size="lg"
                                />
                                <Badge
                                  colorScheme={formik.values.isActive === "ACTIVE" ? "green" : "red"}
                                  variant="subtle"
                                  px={3}
                                  py={1}
                                  rounded="full"
                                  fontSize="sm"
                                >
                                  {formik.values.isActive === "ACTIVE" ? "Active" : "Inactive"}
                                </Badge>
                              </HStack>
                            </FormControl>
                          </VStack>
                        </CardBody>
                      </Card>

                      {/* Action Buttons */}
                      <HStack spacing={4} justify="end" pt={4}>
                        <Button
                          variant="outline"
                          colorScheme="gray"
                          onClick={() => router.push("/teams-center")}
                          size="lg"
                          rounded="xl"
                          px={8}
                        >
                          Cancel
                        </Button>

                        <Button
                          type="submit"
                          isLoading={IsLoadingProcess}
                          loadingText="Creating..."
                          size="lg"
                          rounded="xl"
                          px={8}
                          bgGradient="linear(to-r, secondary.500, secondary.600)"
                          color="white"
                          _hover={{
                            bgGradient: "linear(to-r, secondary.600, secondary.700)",
                            transform: "translateY(-1px)",
                            shadow: "lg",
                          }}
                          transition="all 0.2s"
                          fontWeight="semibold"
                          isDisabled={
                            !formik.values.teamName.trim() ||
                            !formik.values.orgGroupId ||
                            Object.keys(formik.errors).length > 0 ||
                            IsLoadingProcess
                          }
                        >
                          Create Team
                        </Button>
                      </HStack>
                    </VStack>
                  </form>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Sidebar - Team Picture & Info */}
          <GridItem>
            <VStack spacing={6}>
              {/* Team Picture Upload */}
              <Card
                rounded={radiusStyle}
                shadow="lg"
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "white" : "gray.800"}
                w="full"
              >
                <CardBody p={6}>
                  <VStack spacing={4}>
                    <Heading
                      size="md"
                      color={colorMode === "light" ? "gray.800" : "white"}
                      textAlign="center"
                    >
                      Team Picture
                    </Heading>

                    <Center>
                      {imagePreview ? (
                        <Avatar
                          size="2xl"
                          src={imagePreview}
                          border="4px"
                          borderColor="secondary.200"
                        />
                      ) : (
                        <Avatar
                          size="2xl"
                          bg="gray.200"
                          icon={<Icon as={FaUsersRays} boxSize={12} color="gray.500" />}
                        />
                      )}
                    </Center>

                    <VStack spacing={3} w="full">
                      <Button
                        variant="outline"
                        leftIcon={<Icon as={FaImage} />}
                        onClick={() => fileInputRef.current?.click()}
                        size="md"
                        rounded="xl"
                        colorScheme="secondary"
                        w="full"
                      >
                        {selectedImage ? "Change Picture" : "Upload Picture"}
                      </Button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                      />

                      {selectedImage && (
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={removeImage}
                          w="full"
                        >
                          Remove Picture
                        </Button>
                      )}
                    </VStack>

                    {/* Hidden file input */}
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      display="none"
                    />

                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      Upload a team picture (max 5MB)
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              {/* Help Card */}
              <Card
                rounded={radiusStyle}
                shadow="lg"
                border="1px"
                borderColor={colorMode === "light" ? "blue.200" : "blue.700"}
                bg={colorMode === "light" ? "blue.50" : "blue.900"}
                w="full"
              >
                <CardBody p={6}>
                  <VStack spacing={3} align="start">
                    <Heading
                      size="sm"
                      color={colorMode === "light" ? "blue.800" : "blue.200"}
                    >
                      Tips for Creating Teams
                    </Heading>

                    <VStack spacing={2} align="start" fontSize="sm">
                      <Text color={colorMode === "light" ? "blue.700" : "blue.300"}>
                        • Use descriptive team names
                      </Text>
                      <Text color={colorMode === "light" ? "blue.700" : "blue.300"}>
                        • Make sure to create initial that easy to remember
                      </Text>
                      <Text color={colorMode === "light" ? "blue.700" : "blue.300"}>
                        • Select the correct organization
                      </Text>
                      <Text color={colorMode === "light" ? "blue.700" : "blue.300"}>
                        • Add a clear description
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </Box>
    </LayoutAdmin>
  );
}

export default AddTeamViewPage;
