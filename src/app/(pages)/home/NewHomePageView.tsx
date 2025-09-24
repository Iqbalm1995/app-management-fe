"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  getCurrentQuarter,
  getQuarterDateRange,
  getRandomNumberInclusive,
  monthSetMaster,
} from "@/app/helper/MasterHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Select,
  Text,
  useColorMode,
  useColorModeValue,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Avatar,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FiRefreshCcw, FiUsers, FiBarChart3, FiCheckCircle, FiTrendingUp } from "react-icons/fi";
import { MdAssignment } from "react-icons/md";
import { AreaChart, DataSetProps } from "./charts/areaChart";
import {
  DataUserProgressProps,
  StackCardProgress,
} from "./charts/stackCardProgress";
import { PersonalChartProgrss } from "./charts/personalChart";

// Modern Stat Card
const ModernStatCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  color = "blue" 
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: any;
  color?: string;
}) => {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  
  return (
    <Card 
      bg={bg} 
      border="1px solid" 
      borderColor={borderColor}
      shadow="sm"
      _hover={{ shadow: "md", transform: "translateY(-2px)" }}
      transition="all 0.2s"
    >
      <CardBody p={6}>
        <Flex justify="space-between" align="start">
          <Box>
            <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={1}>
              {title}
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="gray.900">
              {value}
            </Text>
            {change && (
              <HStack spacing={1} mt={2}>
                <StatArrow type="increase" />
                <Text fontSize="sm" color="green.500" fontWeight="medium">
                  {change}
                </Text>
              </HStack>
            )}
          </Box>
          <Box 
            p={3} 
            bg={`${color}.50`} 
            borderRadius="lg"
          >
            <Icon as={icon} w={6} h={6} color={`${color}.500`} />
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
};

// Quick Actions Card
const QuickActionsCard = () => {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  
  const actions = [
    { label: "Kanban Board", icon: FiBarChart3, href: "/kanban" },
    { label: "Projects", icon: MdAssignment, href: "/projects-manager" },
    { label: "Teams", icon: FiUsers, href: "/teams" },
    { label: "Calendar", icon: FiCheckCircle, href: "/calendar" },
  ];

  return (
    <Card bg={bg} border="1px solid" borderColor={borderColor} shadow="sm">
      <CardBody p={6}>
        <Heading size="md" mb={4} color="gray.700">Quick Actions</Heading>
        <VStack spacing={3} align="stretch">
          {actions.map((action, idx) => (
            <Flex 
              key={idx}
              as="a"
              href={action.href}
              p={3}
              borderRadius="md"
              bg="gray.50"
              _hover={{ bg: "blue.50", cursor: "pointer" }}
              align="center"
              transition="all 0.2s"
            >
              <Icon as={action.icon} w={5} h={5} color="blue.500" mr={3} />
              <Text fontWeight="medium">{action.label}</Text>
            </Flex>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
};

// Card Component
const CardComponentsDashboard = ({
  tittleCard,
  children,
}: {
  tittleCard: string;
  children: React.ReactNode;
}) => {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  
  return (
    <Card bg={bg} border="1px solid" borderColor={borderColor} shadow="sm">
      <CardBody p={6}>
        <Heading size="md" mb={4} color="gray.700">{tittleCard}</Heading>
        {children}
      </CardBody>
    </Card>
  );
};

function NewHomePageView() {
  const { colorMode } = useColorMode();
  
  // Quarter filter
  const currentYear = new Date().getFullYear();
  const currentQuarter = getCurrentQuarter();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState<number | "all">(currentQuarter);
  const [filteredMonths, setFilteredMonths] = useState<string[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);

  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

  // Auth data
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);

  const [UsersProgress, setUsersProgress] = useState<DataUserProgressProps[]>([]);
  const [DataTaskMonitor, setDataTaskMonitor] = useState<DataSetProps[]>([]);

  const RefreshAction = () => {
    setRefreshData(RefreshData + 1);
  };

  useEffect(() => {
    const { startDate, endDate } = getQuarterDateRange(selectedYear, selectedQuarter);

    if (selectedQuarter === "all") {
      setFilteredMonths(monthSetMaster);
      const DataTaskMonitor: DataSetProps[] = [
        {
          name: "Task Pending",
          data: Array.from({ length: 12 }, () => getRandomNumberInclusive(0, 20)),
        },
        {
          name: "Task On Going",
          data: Array.from({ length: 12 }, () => getRandomNumberInclusive(0, 20)),
        },
        {
          name: "Task Done",
          data: Array.from({ length: 12 }, () => getRandomNumberInclusive(0, 20)),
        },
      ];
      setDataTaskMonitor(DataTaskMonitor);
    } else {
      const startMonthIndex = (selectedQuarter - 1) * 3;
      setFilteredMonths(monthSetMaster.slice(startMonthIndex, startMonthIndex + 3));
      const DataTaskMonitor: DataSetProps[] = [
        {
          name: "Task Pending",
          data: Array.from({ length: 3 }, () => getRandomNumberInclusive(0, 20)),
        },
        {
          name: "Task On Going",
          data: Array.from({ length: 3 }, () => getRandomNumberInclusive(0, 20)),
        },
        {
          name: "Task Done",
          data: Array.from({ length: 3 }, () => getRandomNumberInclusive(0, 20)),
        },
      ];
      setDataTaskMonitor(DataTaskMonitor);
    }

    setUsersProgress([
      { fullname: "Member 1", roleTeam: "BE Developer", progress: getRandomNumberInclusive(0, 300), max: 250 },
      { fullname: "Member 2", roleTeam: "FE Developer", progress: getRandomNumberInclusive(0, 300), max: 250 },
      { fullname: "Member 3", roleTeam: "Manager", progress: getRandomNumberInclusive(0, 300), max: 250 },
      { fullname: "Member 4", roleTeam: "QA", progress: getRandomNumberInclusive(0, 300), max: 250 },
      { fullname: "Member 5", roleTeam: "BE Developer", progress: getRandomNumberInclusive(0, 300), max: 250 },
    ]);
  }, [selectedYear, selectedQuarter, RefreshData]);

  return (
    <LayoutAdmin>
      <Box bg={useColorModeValue("gray.50", "gray.900")} minH="100vh">
        {/* Header Section */}
        <Box bg={useColorModeValue("white", "gray.800")} borderBottom="1px" borderColor={useColorModeValue("gray.200", "gray.700")} px={8} py={6}>
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="lg" color={useColorModeValue("gray.800", "white")} mb={1}>
                Welcome back, {DataAuth?.nama || "User"}
              </Heading>
              <Text color="gray.500" fontSize="md">
                Here's what's happening with your projects today
              </Text>
            </Box>
            <HStack spacing={3}>
              <Select
                value={selectedYear}
                size="md"
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                minW="120px"
                bg={useColorModeValue("white", "gray.700")}
                borderColor={useColorModeValue("gray.300", "gray.600")}
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Select>
              <Select
                value={selectedQuarter}
                size="md"
                onChange={(e) => setSelectedQuarter(e.target.value === "all" ? "all" : Number(e.target.value))}
                minW="80px"
                bg={useColorModeValue("white", "gray.700")}
                borderColor={useColorModeValue("gray.300", "gray.600")}
              >
                <option value="all">All</option>
                <option value="1">Q1</option>
                <option value="2">Q2</option>
                <option value="3">Q3</option>
                <option value="4">Q4</option>
              </Select>
              <Button 
                size="md" 
                variant="outline"
                onClick={RefreshAction}
                borderColor={useColorModeValue("gray.300", "gray.600")}
              >
                <FiRefreshCcw />
              </Button>
            </HStack>
          </Flex>
        </Box>

        {/* Main Content */}
        <Box p={8}>
          <VStack spacing={8} align="stretch">
            {/* Stats Grid */}
            <Grid templateColumns="repeat(12, 1fr)" gap={6}>
              <GridItem colSpan={{ base: 12, md: 3 }}>
                <ModernStatCard
                  title="Total Projects"
                  value="24"
                  change="+12%"
                  icon={MdAssignment}
                  color="blue"
                />
              </GridItem>
              <GridItem colSpan={{ base: 12, md: 3 }}>
                <ModernStatCard
                  title="Active Tasks"
                  value="156"
                  change="+8%"
                  icon={FiCheckCircle}
                  color="green"
                />
              </GridItem>
              <GridItem colSpan={{ base: 12, md: 3 }}>
                <ModernStatCard
                  title="Team Members"
                  value="32"
                  change="+3%"
                  icon={FiUsers}
                  color="purple"
                />
              </GridItem>
              <GridItem colSpan={{ base: 12, md: 3 }}>
                <ModernStatCard
                  title="Completion Rate"
                  value="87%"
                  change="+5%"
                  icon={FiTrendingUp}
                  color="orange"
                />
              </GridItem>
            </Grid>

            {/* Charts and Activity */}
            <Grid templateColumns="repeat(12, 1fr)" gap={6}>
              <GridItem colSpan={{ base: 12, lg: 8 }}>
                <CardComponentsDashboard tittleCard="Task Activity Overview">
                  <AreaChart data={DataTaskMonitor} categories={filteredMonths} />
                </CardComponentsDashboard>
              </GridItem>
              <GridItem colSpan={{ base: 12, lg: 4 }}>
                <QuickActionsCard />
              </GridItem>
            </Grid>

            {/* Team Progress */}
            <Grid templateColumns="repeat(12, 1fr)" gap={6}>
              <GridItem colSpan={{ base: 12, lg: 12 }}>
                <CardComponentsDashboard tittleCard="Team Progress">
                  <Tabs variant="soft-rounded" colorScheme="blue">
                    <TabList mb={4}>
                      <Tab>Personal</Tab>
                      <Tab>Teams</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel p={0}>
                        {UsersProgress.length > 0 ? (
                          <PersonalChartProgrss dt={UsersProgress[0]} />
                        ) : (
                          <Text textAlign="center" py={10} color="gray.500">No Data Available</Text>
                        )}
                      </TabPanel>
                      <TabPanel p={0}>
                        <VStack spacing={3} maxH="300px" overflowY="auto">
                          {UsersProgress.map((dt, index) => (
                            <StackCardProgress key={index} dt={dt} />
                          ))}
                        </VStack>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </CardComponentsDashboard>
              </GridItem>
            </Grid>
          </VStack>
        </Box>
      </Box>
    </LayoutAdmin>
  );
}

export default NewHomePageView;
