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
import {
  ListSearchByParamProps,
  PaggingListPayload,
} from "@/app/types/masterTypes";
import {
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
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
  Text,
  useColorMode,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiFilter,
  FiFrown,
  FiList,
  FiPlusSquare,
  FiRefreshCcw,
  FiTarget,
  FiX,
} from "react-icons/fi";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Data Workflow",
  breadCrumb: ["Home", "Master Data", "Workflow", "Kategori ..."],
};

function WorkflowDetailView() {
  const showToast = useToastHelper();
  const searchParams = useSearchParams();
  const { colorMode } = useColorMode();

  const [HeaderContentState, setHeaderContentState] =
    useState<HeaderContentProps>(HeaderDataContent);

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // hook services
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

  const [ParamFilter, setParamFilter] = useState<ListSearchByParamProps[]>([]);

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

      setHeaderContentState({
        titleName: `Workflow ${itemsData.wfcName}`,
        breadCrumb: [
          "Home",
          "Master Data",
          "Workflow",
          "#" + itemsData.wfcCode,
        ],
      });

      setDataWorkflowCategory(itemsData);
      setIsLoadingPage(false);
      setIsLoadingProcess(false);

      return itemsData;
    }
  };
  // END - Function Detail Data Load Services Workflow Categories

  // Function Detail Data Load Services Workflow Group

  const GetDataWorkflowGroup = async (
    searchValue: string = ""
  ): Promise<WorkflowGroupResponse[]> => {
    setIsLoadingProcess(true);
    const PayloadList: PaggingListPayload = {
      search: searchValue,
      limit: MAX_SIZE_TABLE,
      page: 0,
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

  // END - Function Detail Data Load Services Workflow Group

  // ON LOAD STATE
  useEffect(() => {
    setIsLoadingPage(true);
    if (CategoryId) {
      GetDetailWorkflowCategory(CategoryId);
      GetDataWorkflowGroup("");
    }
  }, [RefreshData, CategoryId]);

  const RefreshAction = () => {
    setDataWorkflowCategory(null);
    setDataWorkflowGroups([]);
    setRefreshData(RefreshData + 1);
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderContentState.titleName}
        breadCrumb={HeaderContentState.breadCrumb}
      />

      <Grid templateColumns="repeat(2, 1fr)" gap={5} w={"full"}>
        <GridItem colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }} w={"full"}>
          <Link href={"/master-data/workflow/"}>
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

      <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"} pt={3}>
        <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }} w={"full"}>
          <Card
            w={"fill"}
            rounded={radiusStyle}
            bgColor={colorMode == "light" ? "white" : "gray.800"}
            minH={"500px"}
          >
            <CardHeader>
              <Heading as="h5" size="md" w={"full"}>
                {DataWorkflowCategory != null && DataWorkflowCategory.wfcName}
              </Heading>
            </CardHeader>
            <CardBody>
              <Flex w={"full"} as={Stack} spacing={4}>
                {/* FILTER DATA */}
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
                      <Link href={`#`}>
                        <Button
                          size={"sm"}
                          colorScheme={"secondary"}
                          leftIcon={<FiPlusSquare />}
                          isLoading={ActionLoading}
                        >
                          Tambah Workflow
                        </Button>
                      </Link>
                    </Flex>
                  </GridItem>
                </Grid>
                {/* RENDER DATA */}
                {IsLoadingPage ? (
                  <LoadingMiniSignature />
                ) : DataWorkflowCategory == null ? (
                  <InvalidLoadPageView />
                ) : (
                  <Flex w={"full"} as={Stack}>
                    <Box
                      overflowY={"auto"}
                      overflowX={"auto"}
                      maxH={"350px"}
                      p={2}
                    >
                      <pre>{JSON.stringify(DataWorkflowGroups, null, 2)}</pre>
                    </Box>
                  </Flex>
                )}
              </Flex>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </LayoutAdmin>
  );
}

export default WorkflowDetailView;
