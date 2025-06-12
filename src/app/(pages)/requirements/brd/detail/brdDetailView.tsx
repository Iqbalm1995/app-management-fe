"use client";

import {
  CustomPanelAlert,
  InputGroupPanel,
} from "@/app/components/customPanels";
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
import useRequirements, {
  RequirementsResponse,
} from "@/app/services/useRequirements";

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
  Wrap,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorMode,
} from "@chakra-ui/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiAlertOctagon,
  FiArrowLeft,
  FiCpu,
  FiFileText,
  FiInfo,
} from "react-icons/fi";
import RequirementBacklogsSection from "./requirementBacklogsSection";
import RequirementFilesSection from "./requirementFilesSection";
import { FaCheckToSlot } from "react-icons/fa6";
import RequirementApprovalSection from "./requirementApprovalSection";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Detail",
  breadCrumb: ["Home", "Project Manager", "Detail"],
};

function BrdDetailView() {
  const showToast = useToastHelper();
  const searchParams = useSearchParams();
  const { colorMode } = useColorMode();

  const { GetDetailById } = useRequirements();

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const [HeaderContentState, setHeaderContentState] =
    useState<HeaderContentProps>(HeaderDataContent);

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

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

  const [ReqId, setReqId] = useState<string | null>(null);
  useEffect(() => {
    // Get the 'projectId' from the search params (query string)
    const id = searchParams.get("reqId");
    if (id) {
      setReqId(id); // Set it to the state
    }
  }, [searchParams]);

  const [DataRequirement, setDataRequirement] =
    useState<RequirementsResponse | null>(null);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  useEffect(() => {
    if (DataAuth && DataAuth.team && ReqId) {
      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await GetDetailById(ReqId, tokenData);
        const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !requestData) {
          showToast({
            description: requestData?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        } else {
          console.log(requestData);
          if (requestData.data == null) {
            showToast({
              description: "Data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }

          const itemsData: RequirementsResponse =
            requestData.data as RequirementsResponse;

          setDataRequirement(itemsData);
          setHeaderContentState({
            titleName: `${itemsData.requirementType} Detail #${itemsData.reqNumber}`,
            breadCrumb: [
              "Home",
              `Requirement ${itemsData.requirementType}`,
              "Detail",
              itemsData.reqNumber,
            ],
          });
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataAuth, RefreshData, ReqId]);

  const RefreshAction = () => {
    setRefreshData(RefreshData + 1);
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderContentState.titleName}
        breadCrumb={HeaderContentState.breadCrumb}
      />
      <Link href={"/requirements/brd"}>
        <Button leftIcon={<FiArrowLeft />} size={"lg"}>
          Back
        </Button>
      </Link>

      <Flex
        bg={colorMode == "light" ? "white" : "gray.700"}
        px={5}
        py={6}
        rounded={radiusStyle}
        w={"full"}
        justify={"space-between"}
        boxShadow={"md"}
      >
        {IsLoadingProcess ? (
          <LoadingMiniSignature />
        ) : (
          <Flex w={"full"}>
            {ReqId && DataRequirement ? (
              <Flex w={"full"} as={Stack}>
                <Tabs size={"lg"} variant={"unstyled"} w={"full"}>
                  <TabList gap={2} overflowX={"auto"}>
                    <Tab
                      rounded={radiusStyle}
                      px={6}
                      _selected={{
                        color: "white",
                        bg: "primary.500",
                        boxShadow: "md",
                      }}
                    >
                      <FiInfo />{" "}
                      <Text pl={2}>
                        Informasi Umum {DataRequirement.requirementType}
                      </Text>
                    </Tab>
                    <Tab
                      rounded={radiusStyle}
                      px={6}
                      _selected={{
                        color: "white",
                        bg: "primary.500",
                        boxShadow: "md",
                      }}
                      isDisabled={!DataRequirement}
                    >
                      <FiCpu />{" "}
                      <Text pl={2}>
                        Daftar Fitur {DataRequirement.requirementType}
                      </Text>
                    </Tab>
                    <Tab
                      rounded={radiusStyle}
                      px={6}
                      _selected={{
                        color: "white",
                        bg: "primary.500",
                        boxShadow: "md",
                      }}
                      isDisabled={!DataRequirement}
                    >
                      <FiFileText /> <Text pl={2}>Lampiran</Text>
                    </Tab>
                    <Tab
                      rounded={radiusStyle}
                      px={6}
                      bg={"yellow.400"}
                      color={"white"}
                      _selected={{
                        color: "white",
                        bg: "secondary.800",
                        boxShadow: "md",
                      }}
                      isDisabled={!DataRequirement}
                      // display={"none"}
                    >
                      <FaCheckToSlot />
                      <Text pl={2}>Review Approval</Text>
                    </Tab>
                  </TabList>
                  <TabPanels pt={8}>
                    {/* 1 */}
                    <TabPanel px={0}>
                      <Text fontSize={"lg"} fontWeight={"bold"}>
                        Coming Soon
                      </Text>
                      {/* <RequirementDetailInfoSection
                        ReqData={DataRequirement}
                        RefreshData={RefreshData}
                        RefreshAction={RefreshAction}
                      /> */}
                    </TabPanel>
                    {/* 2 */}
                    <TabPanel px={0}>
                      <RequirementBacklogsSection
                        ReqData={DataRequirement}
                        RefreshData={RefreshData}
                        RefreshAction={RefreshAction}
                      />
                    </TabPanel>
                    {/* 3 */}
                    <TabPanel px={0}>
                      <RequirementFilesSection
                        ReqData={DataRequirement}
                        RefreshData={RefreshData}
                        RefreshAction={RefreshAction}
                      />
                    </TabPanel>
                    {/* 4 */}
                    <TabPanel px={0}>
                      <RequirementApprovalSection
                        ReqData={DataRequirement}
                        RefreshData={RefreshData}
                        RefreshAction={RefreshAction}
                      />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Flex>
            ) : (
              <CustomPanelAlert type={"error"}>
                <FiAlertOctagon size={70} />
                <Text>Requirement ID tidak ditemukan.</Text>
              </CustomPanelAlert>
            )}
          </Flex>
        )}
      </Flex>
    </LayoutAdmin>
  );
}

export default BrdDetailView;
