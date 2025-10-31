"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  HStack,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getCurrentQuarter, convertQuarterToDateRange } from "@/app/helper/MasterHelper";
import useSnapshotServices, { DashboardFilterRequest, ProjectSummaryDashboardResponse } from "@/app/services/useSnapshotServices";
import { useAuth } from "@/app/context/AuthContext";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DashboardPortfolioPage() {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedQuarter, setSelectedQuarter] = useState<string>(getCurrentQuarter().toString());
  const [chartData, setChartData] = useState<ProjectSummaryDashboardResponse[]>([]);
  
  const { getProjectSummaryDashboard, isLoading, error } = useSnapshotServices();
  const { authData } = useAuth();
  const toast = useToast();

  const headerProps: HeaderContentProps = {
    titleName: "Dashboard Portfolio",
    breadCrumb: ["Home", "Reports", "Dashboard Portfolio"],
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear - i);
  const quarters = [
    { value: "1", label: "Q1" },
    { value: "2", label: "Q2" },
    { value: "3", label: "Q3" },
    { value: "4", label: "Q4" },
  ];

  const handleFilter = async () => {
    if (!authData?.dataAuth?.apiKey) {
      toast({
        title: "Authentication Error",
        description: "Please login to access dashboard data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const dateRange = convertQuarterToDateRange(parseInt(selectedYear), selectedQuarter);
    const filterPayload: DashboardFilterRequest = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };

    try {
      const response = await getProjectSummaryDashboard(filterPayload, authData.dataAuth.apiKey);
      if (response?.data) {
        setChartData(response.data);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Load initial data
  useEffect(() => {
    handleFilter();
  }, []);

  // Chart configuration
  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      height: 350,
    },
    labels: chartData.map(item => item.projectStatus),
    colors: ['#3182CE', '#38A169', '#D69E2E', '#E53E3E', '#805AD5', '#DD6B20'],
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Projects',
              formatter: () => {
                return chartData.reduce((sum, item) => sum + item.projectCount, 0).toString();
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`
    },
    tooltip: {
      y: {
        formatter: (val: number, opts: any) => {
          const dataIndex = opts.dataPointIndex;
          return `${chartData[dataIndex]?.projectCount || 0} projects`;
        }
      }
    }
  };

  const chartSeries = chartData.map(item => item.projectCount);

  return (
    <LayoutAdmin>
      <HeaderContent {...headerProps} />
      <Box p={6}>
        <Card mb={6}>
          <CardBody>
            <Flex justify="space-between" align="center">
              <Tabs variant="solid-rounded" colorScheme="blue" width="100%">
                <TabList>
                  <Tab>General</Tab>
                  <Tab>Special</Tab>
                </TabList>
              </Tabs>
              
              <HStack spacing={4} flexShrink={0} ml={6}>
                <Text fontSize="sm" fontWeight="medium">Year:</Text>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  width="120px"
                >
                  {years.map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </Select>
                
                <Text fontSize="sm" fontWeight="medium">Quarter:</Text>
                <Select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(e.target.value)}
                  width="100px"
                >
                  {quarters.map((quarter) => (
                    <option key={quarter.value} value={quarter.value}>
                      {quarter.label}
                    </option>
                  ))}
                </Select>
                
                <Button 
                  colorScheme="blue" 
                  onClick={handleFilter}
                  isLoading={isLoading}
                  loadingText="Loading..."
                >
                  Filter
                </Button>
              </HStack>
            </Flex>
          </CardBody>
        </Card>

        <Tabs variant="solid-rounded" colorScheme="blue">
          <TabPanels>
            <TabPanel p={0}>
              <Box minH="400px" p={6} bg="gray.50" borderRadius="md">
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                  Project Status Summary - {selectedYear} Q{selectedQuarter}
                </Text>
                {chartData.length > 0 ? (
                  <Chart
                    options={chartOptions}
                    series={chartSeries}
                    type="donut"
                    height={350}
                  />
                ) : (
                  <Flex justify="center" align="center" height="300px">
                    <Text color="gray.500">
                      {isLoading ? "Loading chart data..." : "No data available for selected period"}
                    </Text>
                  </Flex>
                )}
              </Box>
            </TabPanel>
            <TabPanel p={0}>
              <Box minH="400px" p={6} bg="gray.50" borderRadius="md">
                <Text color="gray.500">Special dashboard content will be here</Text>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </LayoutAdmin>
  );
}
