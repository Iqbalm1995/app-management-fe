"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { AuthDataModelInterface, useAuth } from "@/app/context/AuthContext";
import {
  convertToCustomDateFormat,
  getCurrentQuarter,
  getQuarterDateRange,
  getRandomNumberInclusive,
  monthSetMaster,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import { UserActivityResponse } from "@/app/services/useUserActivity";
import { PaggingListPayload } from "@/app/types/masterTypes";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  ListItem,
  OrderedList,
  Select,
  Spacer,
  Stack,
  Tab,
  Table,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorMode,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { IconType } from "react-icons";
import { AiOutlineHeart, AiOutlineUsergroupAdd } from "react-icons/ai";
import { BiCog } from "react-icons/bi";
import { CiMemoPad } from "react-icons/ci";
import { FaDraftingCompass } from "react-icons/fa";
import { FaDiagramProject } from "react-icons/fa6";
import { FiCalendar, FiFilter, FiRefreshCcw, FiTrello } from "react-icons/fi";
import { IoHelpBuoyOutline } from "react-icons/io5";
import { MdOutlineCorporateFare } from "react-icons/md";
import { DataTopStatistic, TopStatisticCard } from "./charts/topStatisticCard";
import { ActvitiesShortTable } from "./charts/shortActivity";
import { RadialBar } from "./charts/radialBar";
import { AreaChart, DataSetProps } from "./charts/areaChart";
import {
  DataUserProgressProps,
  StackCardProgress,
} from "./charts/stackCardProgress";
import { PersonalChartProgrss } from "./charts/personalChart";

// Dynamically load the Chart component to prevent it from being imported server-side
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const HeaderDataContent: HeaderContentProps = {
  titleName: "Beranda",
  breadCrumb: ["Home"],
};

function HomePageView() {
  const { colorMode } = useColorMode();

  // querter filter
  const currentYear = new Date().getFullYear();
  const currentQuarter = getCurrentQuarter();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState<number | "all">(
    currentQuarter
  );
  const [filteredMonths, setFilteredMonths] = useState<string[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);

  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

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

  const [UsersProgress, setUsersProgress] = useState<DataUserProgressProps[]>(
    []
  );

  const RefreshAction = () => {
    setRefreshData(RefreshData + 1);
  };

  const [DataTaskMonitor, setDataTaskMonitor] = useState<DataSetProps[]>([]);
  useEffect(() => {
    const { startDate, endDate } = getQuarterDateRange(
      selectedYear,
      selectedQuarter
    );
    console.log("Selected Range (ISO):", {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    // Filter months based on quarter
    if (selectedQuarter === "all") {
      setFilteredMonths(monthSetMaster);
      const DataTaskMonitor: DataSetProps[] = [
        {
          name: "Task Pending",
          data: [
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
          ],
        },
        {
          name: "Task On Going",
          data: [
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
          ],
        },
        {
          name: "Task Done",
          data: [
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
          ],
        },
      ];
      setDataTaskMonitor(DataTaskMonitor);
    } else {
      const startMonthIndex = (selectedQuarter - 1) * 3;
      setFilteredMonths(
        monthSetMaster.slice(startMonthIndex, startMonthIndex + 3)
      );
      const DataTaskMonitor: DataSetProps[] = [
        {
          name: "Task Pending",
          data: [
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
          ],
        },
        {
          name: "Task On Going",
          data: [
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
          ],
        },
        {
          name: "Task Done",
          data: [
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
            getRandomNumberInclusive(0, 20),
          ],
        },
      ];
      setDataTaskMonitor(DataTaskMonitor);
    }

    setUsersProgress([
      {
        fullname: "Member 1",
        roleTeam: "BE Developer",
        progress: getRandomNumberInclusive(0, 300),
        max: 250,
      },
      {
        fullname: "Member 2",
        roleTeam: "FE Developer",
        progress: getRandomNumberInclusive(0, 300),
        max: 250,
      },
      {
        fullname: "Member 3",
        roleTeam: "Manager",
        progress: getRandomNumberInclusive(0, 300),
        max: 250,
      },
      {
        fullname: "Member 4",
        roleTeam: "QA",
        progress: getRandomNumberInclusive(0, 300),
        max: 250,
      },
      {
        fullname: "Member 5",
        roleTeam: "BE Developer",
        progress: getRandomNumberInclusive(0, 300),
        max: 250,
      },
    ]);
  }, [selectedYear, selectedQuarter, RefreshData]);

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      <VStack spacing={5} alignItems={"start"} w={"full"} pt={5} px={4}>
        {/* <pre>{JSON.stringify(authData, null, 2)}</pre> */}
        <Heading
          as="h3"
          size="md"
          color={colorMode == "light" ? "gray.800" : "white"}
          textTransform={"capitalize"}
        >
          Selamat Datang, {DataAuth && DataAuth.nama.toLocaleLowerCase()}
        </Heading>

        <Flex as={Wrap} w={"full"} justifyContent={"end"} alignItems={"center"}>
          <WrapItem alignItems={"center"}>
            <Text fontWeight={600} pr={2}>
              Filter
            </Text>
          </WrapItem>
          <WrapItem>
            <Select
              value={selectedYear}
              size={"lg"}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              minW={"250px"}
              bgColor={colorMode == "light" ? "white" : "gray.800"}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
          </WrapItem>
          <WrapItem>
            <Select
              value={selectedQuarter}
              size={"lg"}
              onChange={(e) =>
                setSelectedQuarter(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
              minW={"90px"}
              bgColor={colorMode == "light" ? "white" : "gray.800"}
            >
              <option value="all">All</option>
              <option value="1">Q1</option>
              <option value="2">Q2</option>
              <option value="3">Q3</option>
              <option value="4">Q4</option>
            </Select>
          </WrapItem>
          <WrapItem>
            <Button bg={"white"} size={"lg"} onClick={() => RefreshAction()}>
              <FiRefreshCcw />
            </Button>
          </WrapItem>
        </Flex>
        <Grid templateColumns="repeat(12, 1fr)" gap={4} w={"full"}>
          {DataTopStatistic.map((dt, idx) => (
            <GridItem
              key={idx}
              colSpan={{
                base: 12,
                sm: 12,
                md: DataTopStatistic.length < 4 ? 4 : 3,
                lg: DataTopStatistic.length < 4 ? 4 : 3,
              }}
            >
              <TopStatisticCard data={dt} key={idx} />
            </GridItem>
          ))}
        </Grid>
        <Grid templateColumns="repeat(12, 1fr)" gap={4} w={"full"}>
          <GridItem colSpan={{ base: 12, sm: 12, md: 8, lg: 8 }}>
            <CardComponentsDashboard tittleCard={"STATISTIC TASK ACTIVITY"}>
              <AreaChart data={DataTaskMonitor} categories={filteredMonths} />
            </CardComponentsDashboard>
          </GridItem>
          <GridItem colSpan={{ base: 12, sm: 12, md: 4, lg: 4 }}>
            <CardComponentsDashboard tittleCard={"MEMBER TEAM PROGRESS"}>
              <Tabs variant="soft-rounded" colorScheme="primary" px={6}>
                <TabList>
                  <Tab>Personal</Tab>
                  <Tab>Teams</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <Stack
                      w={"full"}
                      spacing={2}
                      // h={"320px"}
                      // overflowY={"auto"}
                    >
                      {UsersProgress.length > 0 ? (
                        <PersonalChartProgrss dt={UsersProgress[0]} />
                      ) : (
                        <Box w={"full"} h={"full"}>
                          <Text textAlign={"center"} pt={10}>
                            No Data
                          </Text>
                        </Box>
                      )}
                    </Stack>
                  </TabPanel>
                  <TabPanel>
                    <Stack
                      w={"full"}
                      spacing={2}
                      h={"320px"}
                      overflowY={"auto"}
                    >
                      {UsersProgress.map((dt, index) => (
                        <StackCardProgress key={index} dt={dt} />
                      ))}
                    </Stack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardComponentsDashboard>
          </GridItem>
          <GridItem colSpan={{ base: 12, sm: 12, md: 4, lg: 4 }}>
            {/* <CardComponentsDashboard tittleCard={"JALAN PINTAS"}>
              <CardLauncherFeature />
            </CardComponentsDashboard> */}
          </GridItem>
          <GridItem colSpan={{ base: 12, sm: 12, md: 8, lg: 8 }}>
            {/* <CardComponentsDashboard tittleCard={"AKSI TERAKHIR"}>
              <ActvitiesShortTable />
            </CardComponentsDashboard> */}
          </GridItem>
        </Grid>
      </VStack>
    </LayoutAdmin>
  );
}

const CardLauncherFeature = () => {
  return (
    <>
      <Wrap justify="start" w={"full"} p={5}>
        {DataButtonLaunchers.map((dt, idx) => (
          <WrapItem key={idx}>
            <ButtonLauncherFeature data={dt} key={idx} />
          </WrapItem>
        ))}
      </Wrap>
    </>
  );
};

interface ButtonLauncherProps {
  label: string;
  icon: IconType;
  link: string;
}

const DataButtonLaunchers: ButtonLauncherProps[] = [
  {
    label: "Add Produk",
    icon: AiOutlineHeart,
    link: "#",
  },
  {
    label: "Tambah Korporat",
    icon: MdOutlineCorporateFare,
    link: "#",
  },
  {
    label: "Helpdask Menu",
    icon: IoHelpBuoyOutline,
    link: "#",
  },
  {
    label: "Konfigurasi",
    icon: BiCog,
    link: "#",
  },
];

const ButtonLauncherFeature = ({ data }: { data: ButtonLauncherProps }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Link href={data.link}>
      <Tooltip label={data.label} hasArrow fontSize="md">
        <Box
          w={{ base: "80px", sm: "100px", md: "150px", lg: "150px" }}
          h={{ base: "80px", sm: "100px", md: "150px", lg: "150px" }}
          bg={"red"}
          bgGradient={"linear(to-br, secondary.500, secondary.700)"}
          boxShadow={"lg"}
          cursor={"pointer"}
          pos={"relative"}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          overflow="hidden" // Ensure the overlay doesn't extend beyond the box
          transition="transform 0.3s ease-in-out"
          // transform={isHovered ? "translateY(-10px)" : "translateY(0)"}
          rounded={"xl"}
          p={6}
          _hover={{
            color: "white",
            // transition: "0.2s ease-in-out",
            // bg: "yellow.400",
            bgGradient: "linear(to-br, secondary.600, secondary.800)",
          }}
        >
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"center"}
            color={"white"}
          >
            <Icon fontSize={80} as={data.icon} />
          </Flex>
        </Box>
      </Tooltip>
    </Link>
  );
};

const CardComponentsDashboard = ({
  tittleCard,
  children,
}: {
  tittleCard: string;
  children: ReactNode;
}) => {
  return (
    <>
      <Flex w={"full"} rounded={radiusStyle} bg={"white"} boxShadow={"md"}>
        <VStack w={"full"} p={0} align={"start"}>
          <Box p={8} w={"full"}>
            <Grid templateColumns="repeat(2, 1fr)">
              <GridItem
                colSpan={{ base: 2, md: 2 }}
                textAlign={{ base: "center", md: "start" }}
                alignContent={"center"}
              >
                <Heading as="h5" size="sm">
                  {tittleCard}
                </Heading>
              </GridItem>
            </Grid>
          </Box>
          <Box pb={8} w={"full"}>
            {children}
          </Box>
        </VStack>
      </Flex>
    </>
  );
};

export default HomePageView;
