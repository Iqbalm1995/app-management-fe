"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import InvalidLoadPageView from "@/app/components/InvalidLoadPageView";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  MAX_SIZE_TABLE,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useWorkflow, { WorkflowGroupResponse } from "@/app/services/useWorkflow";
import useWorkflowCategory, {
  WorkflowCategoryResponse,
} from "@/app/services/useWorkflowCategories";
import { PaggingListPayload } from "@/app/types/masterTypes";
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
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { Checkbox, HStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";

const HeaderDataContent: HeaderContentProps = {
  titleName: `Data Workflow Preset`,
  breadCrumb: ["Home", "Master Data", "Workflow Preset"],
};

// Motion-enhanced version of CardBody
const MotionCardBody = motion(CardBody);

function WorkflowPresetView() {
  // SetUp auth data on current page
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const searchParams = useSearchParams();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const { GetWorkflowCategoryById } = useWorkflowCategory();
  const { ListWorkflowGroups } = useWorkflow();

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null) {
      if (storedData) {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        const UserData: AuthDataResponse =
          StorageAuth.dataLogin as AuthDataResponse;
        setDataAuth(UserData);
      }
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);
  // End SetUp auth data on current page

  const [IsLoadingPage, setIsLoadingPage] = useState(true);
  const [CategoryId, setCategoryId] = useState<string | null>(null);
  useEffect(() => {
    // Get the 'projectId' from the search params (query string)
    const id = searchParams.get("categoryId");
    if (id) {
      setCategoryId(id); // Set it to the state
    }
  }, [searchParams]);

  const [DataWorkflowCategory, setDataWorkflowCategory] =
    useState<WorkflowCategoryResponse | null>(null);
  const [DataWorkflowGroups, setDataWorkflowGroups] = useState<
    WorkflowGroupResponse[]
  >([]);

  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [ActionLoading, setActionLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Checkbox handler
  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  // Function Detail Data Load Services Workflow Categories
  const GetDetailWorkflowCategory = async (
    id: string = ""
  ): Promise<WorkflowCategoryResponse | null> => {
    setIsLoadingProcess(true);

    const token: string = localStorage.getItem("tokenData") as string;
    const requestData = await GetWorkflowCategoryById(id, token);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setIsLoadingProcess(false);
      setIsLoadingPage(false);
      return null;
    } else {
      console.log(requestData);
      if (requestData.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        setIsLoadingProcess(false);
        setIsLoadingPage(false);
        return null;
      }

      const itemsData: WorkflowCategoryResponse =
        requestData.data as WorkflowCategoryResponse;

      setDataWorkflowCategory(itemsData);
      setIsLoadingProcess(false);
      setIsLoadingPage(false);

      return itemsData;
    }
  };

  // Function Detail Data Load Services Workflow Group
  const GetDataWorkflowGroup = async (
    searchValue: string = ""
  ): Promise<WorkflowGroupResponse[]> => {
    setIsLoadingProcess(true);

    const PayloadList: PaggingListPayload = {
      limit: MAX_SIZE_TABLE,
      page: 0,
      search: searchValue,
      filterWhere: [
        {
          field: "parentId",
          operator: "=",
          value: "",
        },
        {
          field: "wfgLevel",
          operator: "=",
          value: "1",
        },
        {
          field: "wfgCategoryId",
          operator: "=",
          value: CategoryId || "",
        },
      ],
      fieldOrder: ["wfgOrder"],
      orderDir: "asc",
    };
    const token: string = localStorage.getItem("tokenData") as string;
    const requestData = await ListWorkflowGroups(PayloadList, token);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setIsLoadingProcess(false);
      return [];
    } else {
      console.log(requestData);
      if (requestData.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        setIsLoadingProcess(false);
        return [];
      }

      const itemsData: WorkflowGroupResponse[] =
        requestData.data as WorkflowGroupResponse[];

      setDataWorkflowGroups(itemsData);
      setIsLoadingProcess(false);

      return itemsData;
    }
  };

  // Refresh function
  const RefreshAction = () => {
    setDataWorkflowCategory(null);
    setDataWorkflowGroups([]);
    setRefreshData(RefreshData + 1);
  };

  // ON LOAD STATE
  useEffect(() => {
    setIsLoadingPage(true);
    if (CategoryId) {
      GetDetailWorkflowCategory(CategoryId);
      GetDataWorkflowGroup("");
    }
  }, [RefreshData, CategoryId]);

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      <Grid templateColumns="repeat(2, 1fr)" gap={5} w={"full"}>
        <GridItem colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }} w={"full"}>
          <Link href={`/master-data/workflow/detail?categoryId=${CategoryId}`}>
            <Button leftIcon={<FiArrowLeft />} size={"md"}>
              Kembali
            </Button>
          </Link>
        </GridItem>
        <GridItem
          colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
          w={"full"}
        ></GridItem>
      </Grid>

      <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
        <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }} w={"full"}>
          <Card
            w={"fill"}
            rounded={radiusStyle}
            bgColor={colorMode == "light" ? "white" : "gray.800"}
            minH={"500px"}
          >
            <CardHeader>
              <Heading as="h5" size="md" w={"full"}>
                {DataWorkflowCategory != null && DataWorkflowCategory.wfcName}{" "}
                WORKFLOW
              </Heading>
              <Text>
                {DataWorkflowCategory != null && DataWorkflowCategory.wfcCode}
              </Text>
            </CardHeader>
            <CardBody>
              <Flex w={"full"} as={Stack} spacing={4}>
                {/* RENDER DATA */}
                {IsLoadingPage ? (
                  <LoadingMiniSignature />
                ) : DataWorkflowCategory == null ? (
                  <InvalidLoadPageView />
                ) : (
                  <VStack spacing={4} align="stretch" w="full">
                    {/* RENDER TREE DATA DataWorkflowGroups HERE */}
                    {DataWorkflowGroups.map((group, index) => (
                      <Box key={group.id} w="full">
                        {/* Level 1 - Main Group */}
                        <Box
                          p={3}
                          bg={colorMode === "light" ? "blue.50" : "blue.900"}
                          border="1px solid"
                          borderColor={colorMode === "light" ? "blue.200" : "blue.700"}
                          rounded="md"
                        >
                          <HStack spacing={3} align="center">
                            <Checkbox
                              isChecked={selectedItems.has(group.id)}
                              onChange={(e) => handleCheckboxChange(group.id, e.target.checked)}
                              colorScheme="blue"
                            />
                            <Text fontSize="sm" fontWeight="bold" color="blue.600" minW="6">
                              {group.wfgOrder}
                            </Text>
                            <Text fontSize="md" fontWeight="semibold" flex={1}>
                              {group.wfgName}
                            </Text>
                          </HStack>
                          {group.wfgDesc && (
                            <Text fontSize="sm" color="gray.600" mt={1} ml={8}>
                              {group.wfgDesc}
                            </Text>
                          )}
                        </Box>

                        {/* Level 2 - Children */}
                        {group.workflowChild && group.workflowChild.length > 0 && (
                          <VStack spacing={2} align="stretch" pl={6} mt={2}>
                            {group.workflowChild.map((child, childIdx) => (
                              <Box key={child.id}>
                                <Box
                                  p={2}
                                  bg={colorMode === "light" ? "green.50" : "green.900"}
                                  border="1px solid"
                                  borderColor={colorMode === "light" ? "green.200" : "green.700"}
                                  rounded="sm"
                                >
                                  <HStack spacing={3} align="center">
                                    <Checkbox
                                      isChecked={selectedItems.has(child.id)}
                                      onChange={(e) => handleCheckboxChange(child.id, e.target.checked)}
                                      colorScheme="green"
                                    />
                                    <Text fontSize="xs" fontWeight="bold" color="green.600" minW="6">
                                      {child.wfgOrder}
                                    </Text>
                                    <Text fontSize="sm" fontWeight="medium" flex={1}>
                                      {child.wfgName}
                                    </Text>
                                  </HStack>
                                  {child.wfgDesc && (
                                    <Text fontSize="xs" color="gray.500" mt={1} ml={8}>
                                      {child.wfgDesc}
                                    </Text>
                                  )}
                                </Box>

                                {/* Level 3 - Grandchildren */}
                                {child.workflowChild && child.workflowChild.length > 0 && (
                                  <VStack spacing={1} align="stretch" pl={6} mt={1}>
                                    {child.workflowChild.map((grandChild, grandChildIdx) => (
                                      <Box
                                        key={grandChild.id}
                                        p={2}
                                        bg={colorMode === "light" ? "gray.50" : "gray.700"}
                                        border="1px solid"
                                        borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                                        rounded="sm"
                                      >
                                        <HStack spacing={3} align="center">
                                          <Checkbox
                                            isChecked={selectedItems.has(grandChild.id)}
                                            onChange={(e) => handleCheckboxChange(grandChild.id, e.target.checked)}
                                            colorScheme="gray"
                                          />
                                          <Text fontSize="xs" fontWeight="bold" color="gray.600" minW="6">
                                            {grandChild.wfgOrder}
                                          </Text>
                                          <Text fontSize="sm" color="gray.700" flex={1}>
                                            {grandChild.wfgName}
                                          </Text>
                                        </HStack>
                                        {grandChild.wfgDesc && (
                                          <Text fontSize="xs" color="gray.500" mt={1} ml={8}>
                                            {grandChild.wfgDesc}
                                          </Text>
                                        )}
                                      </Box>
                                    ))}
                                  </VStack>
                                )}
                              </Box>
                            ))}
                          </VStack>
                        )}
                      </Box>
                    ))}
                  </VStack>
                )}
              </Flex>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* DEBUGING */}
      <Flex w={"full"} as={Stack}>
        <Box p={2} w={"full"} bgColor={"gray.200"}>
          <pre>{JSON.stringify(DataWorkflowCategory, null, 2)}</pre>
        </Box>
        <Box p={2} w={"full"} bgColor={"gray.200"}>
          <pre>{JSON.stringify(DataWorkflowGroups, null, 2)}</pre>
        </Box>
      </Flex>
    </LayoutAdmin>
  );
}

export default WorkflowPresetView;
