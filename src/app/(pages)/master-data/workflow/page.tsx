"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
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
import { WorkflowGroupResponse } from "@/app/services/useWorkflow";
import useWorkflowCategory, {
  WorkflowCategoryResponse,
} from "@/app/services/useWorkflowCategories";
import {
  addParamFilter,
  addParamFilterUpdate,
  ListSearchByParamProps,
  PaggingListPayload,
  removeParamFilter,
} from "@/app/types/masterTypes";
import {
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
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
  Text,
  useColorMode,
  Wrap,
} from "@chakra-ui/react";
import { PaginationState } from "@tanstack/react-table";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiFilter, FiPlusSquare, FiRefreshCcw, FiX } from "react-icons/fi";

const HeaderDataContent: HeaderContentProps = {
  titleName: `Master Data Workflow`,
  breadCrumb: ["Home", "Master Data", "Workflow"],
};

// Motion-enhanced version of CardBody
const MotionCardBody = motion(CardBody);

function MasterDataWorkflowPage() {
  // SetUp auth data on current page
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // hook services
  const { ListWorkflowCategory } = useWorkflowCategory();

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

  const [DataWorkflowCategories, setDataWorkflowCategories] = useState<
    WorkflowCategoryResponse[]
  >([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [ActionLoading, setActionLoading] = useState(false);

  const [ParamFilter, setParamFilter] = useState<ListSearchByParamProps[]>([]);

  // Function Data Load Services Workflow Categories
  const GetDataWorkflowCategories = async (
    searchValue: string = "",
    limit: number = 1
  ): Promise<WorkflowCategoryResponse[]> => {
    setIsLoadingProcess(true);
    const PayloadList: PaggingListPayload = {
      search: searchValue,
      limit: MAX_SIZE_TABLE,
      page: 0,
      filterWhere: [],
      fieldOrder: ["createdAt"],
      orderDir: "asc",
    };
    const token: string = localStorage.getItem("tokenData") as string;
    const requestData = await ListWorkflowCategory(PayloadList, token);
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

      const itemsData: WorkflowCategoryResponse[] =
        requestData.data as WorkflowCategoryResponse[];

      setDataWorkflowCategories(itemsData);
      setIsLoadingProcess(false);

      return itemsData;
    }
  };
  // END - Function Data Load Services Workflow Categories

  // ON LOAD STATE
  useEffect(() => {
    GetDataWorkflowCategories("");
  }, [RefreshData]);

  const RefreshAction = () => {
    setDataWorkflowCategories([]);
    setRefreshData(RefreshData + 1);
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />
      <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
        {/* TABLE SECTION */}
        <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }} w={"full"}>
          <Card w={"fill"} rounded={radiusStyle} minH={"500px"}>
            <CardHeader>
              <Heading as="h5" size="md" w={"full"}>
                Kategori Workflow
              </Heading>
            </CardHeader>
            <CardBody>
              <Flex w={"full"} as={Stack} spacing={4}>
                {/* FILTER DATA & ACTION */}
                <Grid templateColumns="repeat(2, 1fr)" gap={5} w={"full"}>
                  <GridItem
                    colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
                    w={"full"}
                  ></GridItem>
                  <GridItem
                    colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
                    w={"full"}
                  >
                    {/* BUTTON ACTION */}
                    <Flex as={Wrap} justifyContent={"end"} px={0} w={"full"}>
                      <Button
                        size={"sm"}
                        leftIcon={<FiRefreshCcw />}
                        onClick={() => RefreshAction()}
                      >
                        Muat Ulang
                      </Button>
                    </Flex>
                  </GridItem>
                </Grid>
                {/* DATA RENDER */}
                {IsLoadingProcess ? <LoadingMiniSignature /> : <></>}
                <Grid templateColumns="repeat(4, 1fr)" gap={5} w={"full"}>
                  {DataWorkflowCategories.map((dt, idx) => (
                    <GridItem
                      colSpan={{ base: 4, sm: 4, md: 2, lg: 1 }}
                      w={"full"}
                      key={idx}
                    >
                      <Card
                        w="full"
                        shadow="lg"
                        rounded="2xl"
                        overflow="hidden"
                        bg={colorMode === "light" ? "white" : "gray.800"}
                        border="1px"
                        borderColor={
                          colorMode === "light" ? "gray.200" : "gray.600"
                        }
                        // cursor="pointer"
                        transition="all 0.3s ease"
                        _hover={{
                          transform: "translateY(-8px)",
                          shadow: "2xl",
                          borderColor: "secondary.400",
                        }}
                      >
                        <CardHeader
                          bg="secondary.500"
                          color="white"
                          p={6}
                          h={"120px"}
                        >
                          <HStack justify="space-between">
                            <Heading size="md" fontWeight="700">
                              {dt.wfcName}
                            </Heading>
                            <Text
                              fontSize="xs"
                              bg="whiteAlpha.200"
                              px={2}
                              py={1}
                              rounded="full"
                              fontFamily="mono"
                            >
                              #{dt.wfcCode}
                            </Text>
                          </HStack>
                        </CardHeader>

                        <CardBody p={6}>
                          <Stack spacing={4} h={"120px"}>
                            <Text
                              fontSize="sm"
                              color={
                                colorMode === "light" ? "gray.600" : "gray.400"
                              }
                            >
                              {dt.wfcDesc}
                              <Divider my={2} />
                              Workflow category for managing processes and
                              procedures.
                            </Text>

                            <HStack justify="space-between">
                              <Text
                                fontSize="xs"
                                color="gray.500"
                                fontWeight="medium"
                              >
                                Workflow Category
                              </Text>

                              <Link
                                href={`master-data/workflow/detail?id=${dt.id}`}
                              >
                                <Button
                                  size="sm"
                                  colorScheme="secondary"
                                  variant="ghost"
                                >
                                  Detail →
                                </Button>
                              </Link>
                            </HStack>
                          </Stack>
                        </CardBody>
                      </Card>
                    </GridItem>
                  ))}
                </Grid>
              </Flex>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </LayoutAdmin>
  );
}

export default MasterDataWorkflowPage;
