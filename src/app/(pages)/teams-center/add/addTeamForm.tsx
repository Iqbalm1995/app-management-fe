"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useTeams, { TeamInsertPayload } from "@/app/services/useTeams";
import useConstants, {
  ConstantDataResponse,
} from "@/app/services/useConstants";
import {
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Select,
  Textarea,
  Text,
  VStack,
  useColorMode,
  Icon,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaUsersRays, FaArrowLeft } from "react-icons/fa6";
import * as Yup from "yup";

const HeaderDataContent: HeaderContentProps = {
  titleName: `Add New Team`,
  breadCrumb: ["Home", "Teams Center", "Add Team"],
};

interface AddTeamFormProps {}

function AddTeamViewPage({}: AddTeamFormProps) {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const router = useRouter();
  const { InsertTeams } = useTeams();
  const { ListConstantData: ListConstants } = useConstants();

  // Auth setup
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Form state
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [OrganizationData, setOrganizationData] = useState<
    ConstantDataResponse[]
  >([]);

  // Auth effect
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);

  // Load organization data
  useEffect(() => {
    const loadOrganizationData = async () => {
      if (!tokenData) return;

      try {
        const payload = {
          search: "",
          limit: 1000,
          page: 0,
          fieldOrder: ["orgName"],
          orderDir: "asc",
          filterWhere: [
            {
              field: "orgCategory",
              operator: "IN",
              value: ["DIRECTORATE", "DIVISION", "GROUP"],
            },
          ],
        };

        const response = await ListConstants(payload as any, tokenData);
        if (response?.statusCode === RES_CODE_OK && response.data) {
          setOrganizationData(response.data as ConstantDataResponse[]);
        }
      } catch (error) {
        console.error("Error loading organization data:", error);
      }
    };

    if (DataAuth && tokenData) {
      loadOrganizationData();
    }
  }, [DataAuth, tokenData]);

  // Form validation
  const ValidationSchema = Yup.object().shape({
    teamName: Yup.string()
      .required("Team name is required")
      .min(3, "Team name must be at least 3 characters")
      .max(100, "Team name must not exceed 100 characters"),
    teamCode: Yup.string()
      .required("Team code is required")
      .min(2, "Team code must be at least 2 characters")
      .max(20, "Team code must not exceed 20 characters"),
    teamDesc: Yup.string().max(
      500,
      "Description must not exceed 500 characters"
    ),
    orgGroupId: Yup.string().required("Organization group is required"),
  });

  const formik = useFormik<TeamInsertPayload>({
    initialValues: {
      teamName: "",
      teamCode: "",
      teamDesc: "",
      orgGroupId: "",
      orgGroupCode: "",
      isActive: "ACTIVE",
      uploadPict: null,
    },
    validationSchema: ValidationSchema,
    validateOnChange: false,
    validateOnBlur: false,
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

    try {
      setIsLoadingProcess(true);

      // Find selected organization to get the code
      const selectedOrg = OrganizationData.find(
        (org) => org.id === values.orgGroupId
      );
      if (!selectedOrg) {
        showToast({
          description: "Selected organization not found",
          statusToast: "error",
        });
        return;
      }

      const payload: TeamInsertPayload = {
        ...values,
        orgGroupCode: selectedOrg.groupCode,
        teamDesc: values.teamDesc || null,
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

  // Filter organization data by category
  const getOrganizationByCategory = (category: string) => {
    return OrganizationData.filter((org) => org.groupCode === category);
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      <Box mx={{ base: 4, md: 6 }} mt={4} mb={8}>
        <Card
          rounded="2xl"
          shadow="lg"
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <CardHeader
            bg={colorMode === "light" ? "gray.50" : "gray.700"}
            borderTopRadius="2xl"
            borderBottom="1px"
            borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
            py={6}
          >
            <HStack spacing={4}>
              <Box p={3} bg="secondary.500" rounded="xl" color="white">
                <Icon as={FaUsersRays} boxSize={6} />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading
                  size="lg"
                  color={colorMode === "light" ? "gray.800" : "white"}
                >
                  Create New Team
                </Heading>
                <Text color={colorMode === "light" ? "gray.600" : "gray.400"}>
                  Add a new team to the organization
                </Text>
              </VStack>
            </HStack>
          </CardHeader>

          <CardBody p={8}>
            <form onSubmit={formik.handleSubmit}>
              <VStack spacing={8} align="stretch">
                {/* Basic Information */}
                <Box>
                  <Heading
                    size="md"
                    mb={4}
                    color={colorMode === "light" ? "gray.800" : "white"}
                  >
                    Basic Information
                  </Heading>
                  <Grid
                    templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                    gap={6}
                  >
                    <GridItem>
                      <FormControl
                        isInvalid={
                          !!(formik.errors.teamName && formik.touched.teamName)
                        }
                      >
                        <FormLabel fontWeight="semibold">Team Name *</FormLabel>
                        <Input
                          name="teamName"
                          value={formik.values.teamName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="Enter team name"
                          size="lg"
                          rounded="xl"
                        />
                        <FormErrorMessage>
                          {formik.errors.teamName}
                        </FormErrorMessage>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl
                        isInvalid={
                          !!(formik.errors.teamCode && formik.touched.teamCode)
                        }
                      >
                        <FormLabel fontWeight="semibold">Team Code *</FormLabel>
                        <Input
                          name="teamCode"
                          value={formik.values.teamCode}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="Enter team code"
                          size="lg"
                          rounded="xl"
                        />
                        <FormErrorMessage>
                          {formik.errors.teamCode}
                        </FormErrorMessage>
                      </FormControl>
                    </GridItem>
                  </Grid>

                  <FormControl
                    mt={6}
                    isInvalid={
                      !!(formik.errors.teamDesc && formik.touched.teamDesc)
                    }
                  >
                    <FormLabel fontWeight="semibold">Description</FormLabel>
                    <Textarea
                      name="teamDesc"
                      value={formik.values.teamDesc || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter team description"
                      rows={4}
                      rounded="xl"
                      resize="none"
                    />
                    <FormErrorMessage>
                      {formik.errors.teamDesc}
                    </FormErrorMessage>
                  </FormControl>
                </Box>

                {/* Organization Structure */}
                <Box>
                  <Heading
                    size="md"
                    mb={4}
                    color={colorMode === "light" ? "gray.800" : "white"}
                  >
                    Organization Group
                  </Heading>
                  <FormControl
                    isInvalid={
                      !!(formik.errors.orgGroupId && formik.touched.orgGroupId)
                    }
                  >
                    <FormLabel fontWeight="semibold">
                      Select Organization Group *
                    </FormLabel>
                    <Select
                      name="orgGroupId"
                      value={formik.values.orgGroupId}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Select organization group"
                      size="lg"
                      rounded="xl"
                    >
                      {OrganizationData.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.label} ({org.groupCode})
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>
                      {formik.errors.orgGroupId}
                    </FormErrorMessage>
                  </FormControl>
                </Box>

                {/* Action Buttons */}
                <HStack spacing={4} justify="end" pt={4}>
                  <Button
                    variant="outline"
                    colorScheme="gray"
                    leftIcon={<Icon as={FaArrowLeft} />}
                    onClick={() => router.push("/teams-center")}
                    size="lg"
                    rounded="xl"
                    px={8}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="secondary"
                    isLoading={IsLoadingProcess}
                    loadingText="Creating..."
                    leftIcon={<Icon as={FaUsersRays} />}
                    size="lg"
                    rounded="xl"
                    px={8}
                    bgGradient="linear(to-r, secondary.500, secondary.600)"
                    _hover={{
                      bgGradient: "linear(to-r, secondary.600, secondary.700)",
                    }}
                  >
                    Create Team
                  </Button>
                </HStack>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </Box>
    </LayoutAdmin>
  );
}

export default AddTeamViewPage;
