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
  Select,
  Stack,
  Text,
  useColorMode,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import { PaginationState } from "@tanstack/react-table";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiFilter, FiPlusSquare, FiRefreshCcw, FiX } from "react-icons/fi";

const HeaderDataContent: HeaderContentProps = {
  titleName: `Master Data Aplikasi`,
  breadCrumb: ["Home", "Master Data", "Aplikasi"],
};

// Motion-enhanced version of CardBody
const MotionCardBody = motion(CardBody);

// Temporary interface for aplikasi data (replace with actual interface later)
interface AplikasiResponse {
  id: string;
  appName: string;
  appCode: string;
  appDesc: string;
  appStatus: string;
}

function MasterDataAplikasiPage() {
  // SetUp auth data on current page
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

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

  const [DataAplikasi, setDataAplikasi] = useState<AplikasiResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [ActionLoading, setActionLoading] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState<string>("all");

  const [ParamFilter, setParamFilter] = useState<ListSearchByParamProps[]>([]);

  // Function Data Load Services Aplikasi (placeholder)
  const GetDataAplikasi = async (
    searchValue: string = "",
    limit: number = 1
  ): Promise<AplikasiResponse[]> => {
    setIsLoadingProcess(true);
    
    // Simulate API call with dummy data
    await delay(1000);
    
    const dummyData: AplikasiResponse[] = [
      {
        id: "1",
        appName: "Project Management System",
        appCode: "PMS001",
        appDesc: "Comprehensive project management application for enterprise use",
        appStatus: "ACTIVE"
      },
      {
        id: "2", 
        appName: "Human Resource Management",
        appCode: "HRM002",
        appDesc: "Complete HR management solution with payroll integration",
        appStatus: "ACTIVE"
      },
      {
        id: "3",
        appName: "Customer Relationship Management", 
        appCode: "CRM003",
        appDesc: "Advanced CRM system for customer engagement and sales tracking",
        appStatus: "INACTIVE"
      }
    ];

    setDataAplikasi(dummyData);
    setIsLoadingProcess(false);
    return dummyData;
  };
  // END - Function Data Load Services Aplikasi

  const RefreshAction = () => {
    setRefreshData(RefreshData + 1);
  };

  useEffect(() => {
    GetDataAplikasi();
  }, [RefreshData]);

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      <VStack spacing={5} alignItems={"start"} w={"full"} pt={5}>
        <Grid templateColumns="repeat(12, 1fr)" gap={2} w={"full"}>
          <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }}>
            <Flex justifyContent={"start"} px={0} w={"full"}>
              <Stack
                direction={["column", "row"]}
                spacing={2}
                w={"full"}
                justifyContent={"start"}
              >
                <Select
                  value={selectedKategori}
                  size={"md"}
                  onChange={(e) => setSelectedKategori(e.target.value)}
                  minW={"200px"}
                  maxW={"250px"}
                  bg={colorMode === "light" ? "white" : "gray.800"}
                  borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                >
                  <option value="all">Semua Kategori</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="web">Web Application</option>
                  <option value="mobile">Mobile Application</option>
                  <option value="desktop">Desktop Application</option>
                </Select>
              </Stack>
            </Flex>
          </GridItem>
          <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }}>
            <Flex justifyContent={"end"} px={0} w={"full"}>
              <Stack
                direction={["column", "row"]}
                spacing={2}
                w={"full"}
                justifyContent={"end"}
              >
                <Button
                  colorScheme={"secondary"}
                  leftIcon={<FiPlusSquare />}
                  size={"md"}
                  isLoading={ActionLoading}
                  onClick={() => {
                    // Add new aplikasi functionality here
                  }}
                >
                  Tambah Aplikasi
                </Button>
                <Button
                  size={"sm"}
                  leftIcon={<FiRefreshCcw />}
                  onClick={() => {
                    RefreshAction();
                  }}
                >
                  Muat Ulang
                </Button>
              </Stack>
            </Flex>
          </GridItem>
        </Grid>
        
        {/* DATA RENDER */}
        {IsLoadingProcess ? <LoadingMiniSignature /> : <></>}
        <Grid templateColumns="repeat(3, 1fr)" gap={5} w={"full"}>
          {DataAplikasi.map((dt, idx) => (
            <GridItem
              colSpan={{ base: 3, sm: 3, md: 1, lg: 1 }}
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
                      {dt.appName}
                    </Heading>
                    <Text
                      fontSize="xs"
                      bg="whiteAlpha.200"
                      px={2}
                      py={1}
                      rounded="full"
                      fontFamily="mono"
                    >
                      #{dt.appCode}
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
                      {dt.appDesc}
                      <Divider my={2} />
                      Application management for enterprise systems.
                    </Text>

                    <HStack justify="space-between">
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        fontWeight="medium"
                      >
                        Status: {dt.appStatus}
                      </Text>

                      <Button
                        size="sm"
                        colorScheme="secondary"
                        variant="outline"
                        onClick={() => {
                          // Detail functionality here
                        }}
                      >
                        Detail
                      </Button>
                    </HStack>
                  </Stack>
                </CardBody>
              </Card>
            </GridItem>
          ))}
        </Grid>
      </VStack>
    </LayoutAdmin>
  );
}

export default MasterDataAplikasiPage;
