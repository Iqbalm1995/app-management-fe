"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { radiusStyle } from "@/app/constants/applicationConstants";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  HStack,
  VStack,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Grid,
  GridItem,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Badge,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getCurrentQuarter, convertQuarterToDateRange } from "@/app/helper/MasterHelper";
import useSnapshotServices, { DashboardFilterRequest, ProjectSummaryDashboardResponse, ProjectQuarterlyDashboardResponse, DivisionOwnerQuartileDashboardResponse, ProjectCharacteristicsDashboardResponse, ProjectTypeDashboardResponse, ProcurementWorkProgramDashboardResponse, ProjectAcquisitionsDashboardResponse } from "@/app/services/useSnapshotServices";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { FiTrendingUp, FiBarChart, FiActivity, FiRefreshCw } from "react-icons/fi";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DashboardPortfolioPage() {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedQuarter, setSelectedQuarter] = useState<string>(getCurrentQuarter().toString());
  const [chartData, setChartData] = useState<ProjectSummaryDashboardResponse[]>([]);
  const [quarterlyData, setQuarterlyData] = useState<ProjectQuarterlyDashboardResponse[]>([]);
  const [divisionData, setDivisionData] = useState<DivisionOwnerQuartileDashboardResponse[]>([]);
  const [characteristicsData, setCharacteristicsData] = useState<ProjectCharacteristicsDashboardResponse[]>([]);
  const [projectTypeData, setProjectTypeData] = useState<ProjectTypeDashboardResponse[]>([]);
  const [procurementWorkProgramData, setProcurementWorkProgramData] = useState<ProcurementWorkProgramDashboardResponse[]>([]);
  const [projectAcquisitionsData, setProjectAcquisitionsData] = useState<ProjectAcquisitionsDashboardResponse[]>([]);
  const [tokenData, setTokenData] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  const { getProjectSummaryDashboard, getProjectQuarterlyDashboard, getDivisionOwnerQuartileDashboard, getProjectCharacteristicsDashboard, getProjectTypeDashboard, getProcurementWorkProgramDashboard, getProjectAcquisitionsDashboard, isLoading, error } = useSnapshotServices();
  const toast = useToast();

  // Load token from localStorage
  useEffect(() => {
    const token: string = localStorage.getItem("tokenData") as string;
    if (token) {
      setTokenData(token);
    }
  }, []);

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

  // Month name mapping
  const getMonthName = (monthNumber: number): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNumber - 1] || monthNumber.toString();
  };

  // Shorten division name
  const shortenDivisionName = (fullName: string): string => {
    // Remove "DIVISI" prefix if exists
    let name = fullName.replace(/^DIVISI\s+/i, '');
    
    // Split into words and take first letter of each word
    const words = name.split(/\s+/).filter(word => word.length > 0);
    const initials = words.map(word => word.charAt(0).toUpperCase()).join('');
    
    return initials || fullName;
  };

  // Get quarter months with proper mapping
  const getQuarterMonths = (quarter: string): { monthPeriod: number; monthName: string }[] => {
    const quarterMap: { [key: string]: number[] } = {
      '1': [1, 2, 3],   // Q1: Jan, Feb, Mar
      '2': [4, 5, 6],   // Q2: Apr, May, Jun
      '3': [7, 8, 9],   // Q3: Jul, Aug, Sep
      '4': [10, 11, 12] // Q4: Oct, Nov, Dec
    };
    
    return quarterMap[quarter]?.map(month => ({
      monthPeriod: month,
      monthName: getMonthName(month)
    })) || [];
  };

  // Load quarterly data from RPT_PROJECT_QUARTAL table
  const loadQuarterlyData = async () => {
    if (!tokenData) return;

    const dateRange = convertQuarterToDateRange(parseInt(selectedYear), `Q${selectedQuarter}`);
    const filterPayload: DashboardFilterRequest = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };

    try {
      const response = await getProjectQuarterlyDashboard(filterPayload, tokenData);
      const apiData = response?.data || [];
      
      // Always show 3 months for the selected quarter
      const quarterMonths = getQuarterMonths(selectedQuarter);
      const completeData = quarterMonths.map(({ monthPeriod, monthName }) => {
        const existingData = apiData.find(item => item.monthPeriod === monthPeriod);
        return {
          monthPeriod,
          monthName,
          projectCount: existingData?.projectCount || 0,
          yearPeriod: parseInt(selectedYear),
          quartalPeriod: parseInt(selectedQuarter)
        };
      });
      
      setQuarterlyData(completeData);
    } catch (err) {
      console.error("Failed to load quarterly data:", err);
    }
  };

  // Load division owner quartile data
  const loadDivisionData = async () => {
    if (!tokenData) return;

    const dateRange = convertQuarterToDateRange(parseInt(selectedYear), `Q${selectedQuarter}`);
    const filterPayload: DashboardFilterRequest = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };

    try {
      const response = await getDivisionOwnerQuartileDashboard(filterPayload, tokenData);
      const apiData = response?.data || [];
      
      // Get unique divisions, limit to 5, and randomize order
      const quarterMonths = getQuarterMonths(selectedQuarter);
      let uniqueDivisions = [...new Set(apiData.map(item => item.divisionName))];
      
      // Randomize division order
      uniqueDivisions = uniqueDivisions.sort(() => Math.random() - 0.5);
      
      // Limit to maximum 5 divisions
      uniqueDivisions = uniqueDivisions.slice(0, 5);
      
      const completeData: DivisionOwnerQuartileDashboardResponse[] = [];
      
      // If no divisions, create empty structure
      if (uniqueDivisions.length === 0) {
        quarterMonths.forEach(({ monthPeriod, monthName }) => {
          completeData.push({
            divisionName: 'No Data',
            monthPeriod,
            monthName,
            projectCount: 0,
            yearPeriod: parseInt(selectedYear),
            quartalPeriod: parseInt(selectedQuarter)
          });
        });
      } else {
        // Create complete data for each division and month
        uniqueDivisions.forEach(division => {
          quarterMonths.forEach(({ monthPeriod, monthName }) => {
            const existingData = apiData.find(item => 
              item.divisionName === division && item.monthPeriod === monthPeriod
            );
            completeData.push({
              divisionName: division,
              monthPeriod,
              monthName,
              projectCount: existingData?.projectCount || 0,
              yearPeriod: parseInt(selectedYear),
              quartalPeriod: parseInt(selectedQuarter)
            });
          });
        });
      }
      
      setDivisionData(completeData);
    } catch (err) {
      console.error("Failed to load division data:", err);
    }
  };

  // Update division data when quarter/year changes
  useEffect(() => {
    if (tokenData) {
      loadDivisionData();
    }
  }, [selectedQuarter, selectedYear, tokenData]);

  // Update quarterly data when quarter/year changes
  useEffect(() => {
    if (tokenData) {
      loadQuarterlyData();
    }
  }, [selectedQuarter, selectedYear, tokenData]);

  // Load project characteristics data
  const loadCharacteristicsData = async () => {
    if (!tokenData) return;

    const dateRange = convertQuarterToDateRange(parseInt(selectedYear), `Q${selectedQuarter}`);
    const filterPayload: DashboardFilterRequest = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };

    try {
      const response = await getProjectCharacteristicsDashboard(filterPayload, tokenData);
      const apiData = response?.data || [];
      
      // Randomize and limit to 7 characteristics
      let randomizedData = [...apiData].sort(() => Math.random() - 0.5).slice(0, 7);
      
      setCharacteristicsData(randomizedData);
    } catch (err) {
      console.error("Failed to load characteristics data:", err);
    }
  };

  // Load project type data
  const loadProjectTypeData = async () => {
    if (!tokenData) return;

    const dateRange = convertQuarterToDateRange(parseInt(selectedYear), `Q${selectedQuarter}`);
    const filterPayload: DashboardFilterRequest = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    };

    try {
      const response = await getProjectTypeDashboard(filterPayload, tokenData);
      const apiData = response?.data || [];
      
      setProjectTypeData(apiData);
    } catch (err) {
      console.error("Failed to load project type data:", err);
    }
  };

  // Load procurement work program data
  const loadProcurementWorkProgramData = async () => {
    if (!tokenData) return;

    const dateRange = convertQuarterToDateRange(parseInt(selectedYear), `Q${selectedQuarter}`);
    const filterPayload: DashboardFilterRequest = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    };

    try {
      const response = await getProcurementWorkProgramDashboard(filterPayload, tokenData);
      const apiData = response?.data || [];
      
      setProcurementWorkProgramData(apiData);
    } catch (err) {
      console.error("Failed to load procurement work program data:", err);
    }
  };

  // Load project acquisitions data
  const loadProjectAcquisitionsData = async () => {
    if (!tokenData) return;

    const dateRange = convertQuarterToDateRange(parseInt(selectedYear), `Q${selectedQuarter}`);
    const filterPayload: DashboardFilterRequest = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    };

    try {
      const response = await getProjectAcquisitionsDashboard(filterPayload, tokenData);
      const apiData = response?.data || [];
      
      // Randomize and limit to 7 acquisitions
      let randomizedData = [...apiData].sort(() => Math.random() - 0.5).slice(0, 7);
      
      setProjectAcquisitionsData(randomizedData);
    } catch (err) {
      console.error("Failed to load project acquisitions data:", err);
    }
  };

  // Update characteristics data when quarter/year changes
  useEffect(() => {
    if (tokenData) {
      loadCharacteristicsData();
    }
  }, [selectedQuarter, selectedYear, tokenData]);

  // Update project type data when quarter/year changes
  useEffect(() => {
    if (tokenData) {
      loadProjectTypeData();
    }
  }, [selectedQuarter, selectedYear, tokenData]);

  // Update procurement work program data when quarter/year changes
  useEffect(() => {
    if (tokenData) {
      loadProcurementWorkProgramData();
    }
  }, [selectedQuarter, selectedYear, tokenData]);

  // Update project acquisitions data when quarter/year changes
  useEffect(() => {
    if (tokenData) {
      loadProjectAcquisitionsData();
    }
  }, [selectedQuarter, selectedYear, tokenData]);

  const handleFilter = async () => {
    if (!tokenData) {
      toast({
        title: "Authentication Error",
        description: "Please login to access dashboard data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Load all chart data
      await Promise.all([
        loadProjectSummaryData(),
        loadQuarterlyData(),
        loadDivisionData(),
        loadCharacteristicsData()
      ]);
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

  // Load project summary data
  const loadProjectSummaryData = async () => {
    if (!tokenData) return;

    const dateRange = convertQuarterToDateRange(parseInt(selectedYear), `Q${selectedQuarter}`);
    const filterPayload: DashboardFilterRequest = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };

    try {
      const response = await getProjectSummaryDashboard(filterPayload, tokenData);
      if (response?.data) {
        setChartData(response.data);
        // Extract last updated from first item (all items have same timestamp)
        if (response.data.length > 0 && response.data[0].lastUpdated) {
          setLastUpdated(response.data[0].lastUpdated);
        }
      }
    } catch (err) {
      console.error("Failed to load project summary data:", err);
    }
  };

  // Load initial data and update when filters change
  useEffect(() => {
    if (tokenData) {
      loadProjectSummaryData();
    }
  }, [selectedQuarter, selectedYear, tokenData]);

  // Chart configuration
  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      height: 400,
      fontFamily: 'Inter, sans-serif',
      animations: {
        enabled: true,
        speed: 800,
      }
    },
    labels: chartData.map(item => item.projectStatus),
    colors: ['#3182CE', '#38A169', '#D69E2E', '#E53E3E', '#805AD5', '#DD6B20', '#319795', '#E56399'],
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '14px',
      fontWeight: 500,
      markers: {
        size: 12,
      },
      itemMargin: {
        horizontal: 8,
        vertical: 4
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
              color: '#2D3748'
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 700,
              color: '#1A202C',
              formatter: (val: string) => parseInt(val).toString()
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Total Projects',
              fontSize: '14px',
              fontWeight: 500,
              color: '#718096',
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
      formatter: (val: number) => `${val.toFixed(1)}%`,
      style: {
        fontSize: '12px',
        fontWeight: 600,
        colors: ['#FFFFFF']
      },
      dropShadow: {
        enabled: true,
        blur: 2,
        opacity: 0.8
      }
    },
    tooltip: {
      enabled: true,
      style: {
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif'
      },
      y: {
        formatter: (val: number, opts: any) => {
          const dataIndex = opts.dataPointIndex;
          const count = chartData[dataIndex]?.projectCount || 0;
          return `${count} project${count !== 1 ? 's' : ''}`;
        }
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['#FFFFFF']
    }
  };

  const chartSeries = chartData.map(item => item.projectCount);

  // Quarterly Chart Configuration - Vertical Column Chart
  const quarterlyChartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 300,
      fontFamily: 'Inter, sans-serif',
      animations: {
        enabled: true,
        speed: 800,
      },
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        }
      }
    },
    colors: ['#38A169'],
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: {
        fontSize: '12px',
        fontWeight: 600,
        colors: ['#2D3748']
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: quarterlyData.map(item => item.monthName || getMonthName(item.monthPeriod)),
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500,
          colors: ['#4A5568']
        }
      }
    },
    yaxis: {
      title: {
        text: 'Total Projects',
        style: {
          fontSize: '12px',
          fontWeight: 500,
          color: '#4A5568'
        }
      },
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500,
          colors: ['#4A5568']
        }
      }
    },
    grid: {
      borderColor: '#E2E8F0',
      strokeDashArray: 3,
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    tooltip: {
      shared: false,
      intersect: true,
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif'
      },
      y: {
        formatter: (val: number) => `${val} projects`
      }
    }
  };

  const quarterlyChartSeries = [
    {
      name: 'Total Projects',
      data: quarterlyData.map(item => item.projectCount)
    }
  ];

  // Division Owner Quartile Chart Configuration - Horizontal Stacked Bar Chart
  const divisionChartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 400,
      stacked: true,
      fontFamily: 'Inter, sans-serif',
      animations: {
        enabled: true,
        speed: 800,
      },
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        dataLabels: {
          position: 'center'
        }
      }
    },
    colors: ['#3182CE', '#319795', '#D69E2E'],
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val > 0 ? `${val}` : '',
      style: {
        fontSize: '11px',
        fontWeight: 600,
        colors: ['#FFFFFF']
      }
    },
    stroke: {
      show: true,
      width: 1,
      colors: ['#FFFFFF']
    },
    xaxis: {
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500,
          colors: ['#4A5568']
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500,
          colors: ['#4A5568']
        }
      }
    },
    grid: {
      borderColor: '#E2E8F0',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: true
        }
      }
    },
    tooltip: {
      shared: false,
      intersect: true,
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif'
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      fontSize: '12px',
      fontWeight: 500,
      markers: {
        size: 12,
        strokeWidth: 0,
        shape: 'square'
      }
    }
  };

  // Prepare division chart series data
  const getDivisionChartSeries = () => {
    const quarterMonths = getQuarterMonths(selectedQuarter);
    const uniqueDivisions = [...new Set(divisionData.map(item => item.divisionName))];
    
    return quarterMonths.map(({ monthName }) => ({
      name: monthName || '',
      data: uniqueDivisions.map(division => {
        const divisionItem = divisionData.find(item => 
          item.divisionName === division && item.monthName === monthName
        );
        return divisionItem?.projectCount || 0;
      })
    }));
  };

  const divisionChartSeries = getDivisionChartSeries();
  const divisionCategories = [...new Set(divisionData.map(item => shortenDivisionName(item.divisionName)))];
  const divisionFullNames = [...new Set(divisionData.map(item => item.divisionName))];

  // Project Characteristics Chart Configuration
  const characteristicsChartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 400,
      fontFamily: 'Inter, sans-serif',
      toolbar: { show: false }
    },
    plotOptions: {
      bar: { 
        horizontal: true, 
        borderRadius: 4,
        distributed: true
      }
    },
    colors: ['#ED8936', '#38B2AC', '#3182CE', '#805AD5', '#D69E2E', '#E53E3E', '#38A169'],
    fill: {
      colors: ['#ED8936', '#38B2AC', '#3182CE', '#805AD5', '#D69E2E', '#E53E3E', '#38A169']
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val > 0 ? `${val}` : ''
    },
    xaxis: {
      categories: characteristicsData.map(item => item.characteristicName)
    },
    tooltip: {
      y: { formatter: (val: number) => `${val} projects` }
    }
  };

  // Project Type Pie Chart Configuration
  const projectTypeChartOptions: ApexOptions = {
    chart: {
      type: 'pie',
      height: 400,
      fontFamily: 'Inter, sans-serif'
    },
    colors: ['#ED8936', '#38B2AC', '#3182CE', '#805AD5', '#D69E2E', '#E53E3E', '#38A169', '#F56565', '#48BB78'],
    labels: projectTypeData.map(item => item.projectTypeName),
    dataLabels: {
      enabled: true,
      formatter: (val: number, opts: any) => {
        const count = projectTypeData[opts.seriesIndex]?.projectCount || 0;
        return `${count}`;
      }
    },
    legend: {
      position: 'bottom'
    },
    tooltip: {
      y: { formatter: (val: number) => `${val} projects` }
    }
  };

  const projectTypeChartSeries = projectTypeData.map(item => item.projectCount);

  // Procurement Work Program Donut Chart Configuration
  const procurementWorkProgramChartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      height: 400,
      fontFamily: 'Inter, sans-serif'
    },
    colors: ['#ED8936', '#38B2AC', '#3182CE', '#805AD5', '#D69E2E', '#E53E3E', '#38A169', '#F56565', '#48BB78'],
    labels: procurementWorkProgramData.map(item => item.procurementWorkProgramFlag),
    dataLabels: {
      enabled: true,
      formatter: (val: number, opts: any) => {
        const count = procurementWorkProgramData[opts.seriesIndex]?.projectCount || 0;
        return `${count}`;
      }
    },
    legend: {
      position: 'bottom'
    },
    tooltip: {
      y: { formatter: (val: number) => `${val} projects` }
    }
  };

  const procurementWorkProgramChartSeries = procurementWorkProgramData.map(item => item.projectCount);

  const characteristicsChartSeries = [{
    name: 'Projects',
    data: characteristicsData.map(item => item.projectCount)
  }];

  // Project Acquisitions Bar Chart Configuration (same as characteristics)
  const projectAcquisitionsChartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 400,
      fontFamily: 'Inter, sans-serif'
    },
    colors: ['#ED8936', '#38B2AC', '#3182CE', '#805AD5', '#D69E2E', '#E53E3E', '#38A169'],
    plotOptions: {
      bar: {
        distributed: true,
        horizontal: true,
        columnWidth: '60%'
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}`
    },
    xaxis: {
      title: { text: 'Project Count' }
    },
    yaxis: {
      categories: projectAcquisitionsData.map(item => item.projectAcquisitionName),
      labels: {
        style: { fontSize: '12px' }
      }
    },
    legend: { show: false },
    tooltip: {
      y: { formatter: (val: number) => `${val} projects` }
    }
  };

  const projectAcquisitionsChartSeries = [{
    name: 'Projects',
    data: projectAcquisitionsData.map(item => item.projectCount)
  }];

  // Update division chart options with categories and tooltips
  const divisionChartOptionsWithCategories: ApexOptions = {
    ...divisionChartOptions,
    xaxis: {
      ...divisionChartOptions.xaxis,
      categories: divisionCategories
    },
    tooltip: {
      shared: false,
      intersect: true,
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif'
      },
      y: {
        formatter: (val: number, opts: any) => {
          const seriesIndex = opts.seriesIndex;
          const dataPointIndex = opts.dataPointIndex;
          const quarterMonths = getQuarterMonths(selectedQuarter);
          const monthName = quarterMonths[seriesIndex]?.monthName || '';
          const fullDivisionName = divisionFullNames[dataPointIndex] || '';
          return `${monthName}: ${val} projects<br/>Division: ${fullDivisionName}`;
        }
      }
    }
  };

  return (
    <LayoutAdmin>
      <HeaderContent {...headerProps} />
      <Box p={6}>
        {/* Filter Controls */}
        <Card mb={6} rounded={radiusStyle} shadow="lg" bg="white">
          <CardBody>
            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
              <Tabs variant="soft-rounded" colorScheme="blue">
                <TabList bg="gray.100" p={1} rounded={radiusStyle}>
                  <Tab rounded={radiusStyle} _selected={{ bg: "blue.500", color: "white" }}>
                    <Icon as={FiBarChart} mr={2} />
                    General
                  </Tab>
                  <Tab rounded={radiusStyle} _selected={{ bg: "blue.500", color: "white" }}>
                    <Icon as={FiActivity} mr={2} />
                    Special
                  </Tab>
                </TabList>
              </Tabs>
              
              <HStack spacing={4} bg="gray.50" p={4} rounded={radiusStyle}>
                <VStack spacing={1} align="start">
                  <Text fontSize="xs" color="gray.600" fontWeight="medium">Year</Text>
                  <Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    size="sm"
                    bg="white"
                    rounded={radiusStyle}
                    border="1px solid"
                    borderColor="gray.200"
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                  >
                    {years.map((year) => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </Select>
                </VStack>
                
                <VStack spacing={1} align="start">
                  <Text fontSize="xs" color="gray.600" fontWeight="medium">Quarter</Text>
                  <Select
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(e.target.value)}
                    size="sm"
                    bg="white"
                    rounded={radiusStyle}
                    border="1px solid"
                    borderColor="gray.200"
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px blue.400" }}
                  >
                    {quarters.map((quarter) => (
                      <option key={quarter.value} value={quarter.value}>
                        {quarter.label}
                      </option>
                    ))}
                  </Select>
                </VStack>
                
                <VStack spacing={1} align="start">
                  <Text fontSize="xs" color="transparent">Action</Text>
                  <Button 
                    colorScheme="blue" 
                    onClick={handleFilter}
                    isLoading={isLoading}
                    loadingText="Loading..."
                    size="sm"
                    rounded={radiusStyle}
                    leftIcon={<FiRefreshCw />}
                    _hover={{ transform: "translateY(-1px)", shadow: "md" }}
                    transition="all 0.2s"
                  >
                    Filter
                  </Button>
                </VStack>
              </HStack>
            </Flex>
          </CardBody>
        </Card>

        <Tabs variant="unstyled">
          <TabPanels>
            <TabPanel p={0}>
              {/* 12-Column Grid Layout */}
              <Grid 
                templateColumns="repeat(12, 1fr)" 
                gap={6}
                autoRows="min-content"
              >
                {/* Project Summary - 4 cols */}
                <GridItem colSpan={{ base: 12, md: 6, lg: 4 }}>
                  <Card rounded={radiusStyle} shadow="lg" bg="white" h="full">
                    <CardHeader bg="blue.500" color="white" roundedTop={radiusStyle}>
                      <Flex justify="space-between" align="center">
                        <HStack>
                          <Icon as={FiTrendingUp} />
                          <Text fontSize="md" fontWeight="bold">
                            Project Summary
                          </Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            onClick={handleFilter} 
                            isLoading={isLoading}
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            <FiRefreshCw />
                          </Button>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            Details
                          </Button>
                        </HStack>
                      </Flex>
                    </CardHeader>
                    <CardBody p={4}>
                      {chartData.length > 0 ? (
                        <Box>
                          <Chart
                            options={chartOptions}
                            series={chartSeries}
                            type="donut"
                            height={300}
                          />
                          <HStack justify="center" mt={4} spacing={6}>
                            <Stat textAlign="center" size="sm">
                              <StatLabel color="gray.600">Total</StatLabel>
                              <StatNumber color="blue.600" fontSize="lg">
                                {chartData.reduce((sum, item) => sum + item.projectCount, 0)}
                              </StatNumber>
                            </Stat>
                            <Stat textAlign="center" size="sm">
                              <StatLabel color="gray.600">Categories</StatLabel>
                              <StatNumber color="green.600" fontSize="lg">{chartData.length}</StatNumber>
                            </Stat>
                          </HStack>
                        </Box>
                      ) : (
                        <Flex justify="center" align="center" height="300px" direction="column">
                          <Icon as={FiBarChart} size="48px" color="gray.300" mb={4} />
                          <Text color="gray.500" fontSize="sm" textAlign="center">
                            {isLoading ? "Loading..." : "No data available"}
                          </Text>
                        </Flex>
                      )}
                    </CardBody>
                  </Card>
                </GridItem>

                {/* Project Quarterly - 4 cols */}
                <GridItem colSpan={{ base: 12, md: 6, lg: 4 }}>
                  <Card rounded={radiusStyle} shadow="lg" bg="white" h="full">
                    <CardHeader bg="green.500" color="white" roundedTop={radiusStyle}>
                      <Flex justify="space-between" align="center">
                        <HStack>
                          <Icon as={FiActivity} />
                          <Text fontSize="md" fontWeight="bold">
                            Project Quarterly
                          </Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            onClick={loadQuarterlyData}
                            isLoading={isLoading}
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            <FiRefreshCw />
                          </Button>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            Details
                          </Button>
                        </HStack>
                      </Flex>
                    </CardHeader>
                    <CardBody p={4}>
                      {quarterlyData.length > 0 ? (
                        <Box>
                          <Chart
                            options={quarterlyChartOptions}
                            series={quarterlyChartSeries}
                            type="bar"
                            height={300}
                          />
                          <HStack justify="center" mt={4} spacing={6}>
                            <Stat textAlign="center" size="sm">
                              <StatLabel color="gray.600">Q{selectedQuarter} Total</StatLabel>
                              <StatNumber color="green.600" fontSize="lg">
                                {quarterlyData.reduce((sum, item) => sum + item.projectCount, 0)}
                              </StatNumber>
                            </Stat>
                            <Stat textAlign="center" size="sm">
                              <StatLabel color="gray.600">Avg per Month</StatLabel>
                              <StatNumber color="blue.600" fontSize="lg">
                                {quarterlyData.length > 0 ? Math.round(quarterlyData.reduce((sum, item) => sum + item.projectCount, 0) / quarterlyData.length) : 0}
                              </StatNumber>
                            </Stat>
                          </HStack>
                        </Box>
                      ) : (
                        <Flex justify="center" align="center" height="300px" direction="column">
                          <Icon as={FiActivity} size="48px" color="gray.300" mb={4} />
                          <Text color="gray.500" fontSize="sm" textAlign="center">
                            {isLoading ? "Loading..." : "No quarterly data available"}
                          </Text>
                        </Flex>
                      )}
                    </CardBody>
                  </Card>
                </GridItem>

                {/* Project Division Owner Quartile - 4 cols */}
                <GridItem colSpan={{ base: 12, md: 6, lg: 4 }}>
                  <Card rounded={radiusStyle} shadow="lg" bg="white" h="full">
                    <CardHeader bg="purple.500" color="white" roundedTop={radiusStyle}>
                      <Flex justify="space-between" align="center">
                        <HStack>
                          <Icon as={FiTrendingUp} />
                          <Text fontSize="md" fontWeight="bold">
                            Division Owner Quartile
                          </Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            onClick={loadDivisionData}
                            isLoading={isLoading}
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            <FiRefreshCw />
                          </Button>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            Details
                          </Button>
                        </HStack>
                      </Flex>
                    </CardHeader>
                    <CardBody p={4}>
                      {divisionData.length > 0 ? (
                        <Box>
                          <Chart
                            options={divisionChartOptionsWithCategories}
                            series={divisionChartSeries}
                            type="bar"
                            height={400}
                          />
                          <HStack justify="center" mt={4} spacing={6}>
                            <Stat textAlign="center" size="sm">
                              <StatLabel color="gray.600">Q{selectedQuarter} Divisions</StatLabel>
                              <StatNumber color="purple.600" fontSize="lg">
                                {divisionCategories.length}
                              </StatNumber>
                            </Stat>
                            <Stat textAlign="center" size="sm">
                              <StatLabel color="gray.600">Total Projects</StatLabel>
                              <StatNumber color="blue.600" fontSize="lg">
                                {divisionData.reduce((sum, item) => sum + item.projectCount, 0)}
                              </StatNumber>
                            </Stat>
                          </HStack>
                        </Box>
                      ) : (
                        <Flex justify="center" align="center" height="400px" direction="column">
                          <Icon as={FiBarChart} size="48px" color="gray.300" mb={4} />
                          <Text color="gray.500" fontSize="sm" textAlign="center">
                            No division data available for Q{selectedQuarter} {selectedYear}
                          </Text>
                        </Flex>
                      )}
                    </CardBody>
                  </Card>
                </GridItem>

                {/* Project Characteristics - 6 cols */}
                <GridItem colSpan={{ base: 12, md: 6 }}>
                  <Card rounded={radiusStyle} shadow="lg" bg="white" h="full">
                    <CardHeader bg="orange.500" color="white" roundedTop={radiusStyle}>
                      <Flex justify="space-between" align="center">
                        <HStack>
                          <Icon as={FiActivity} />
                          <Text fontSize="md" fontWeight="bold">
                            Project Characteristics
                          </Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            onClick={loadCharacteristicsData}
                            isLoading={isLoading}
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            <FiRefreshCw />
                          </Button>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            Details
                          </Button>
                        </HStack>
                      </Flex>
                    </CardHeader>
                    <CardBody p={4}>
                      {characteristicsData.length > 0 ? (
                        <Box>
                          <Chart
                            options={characteristicsChartOptions}
                            series={characteristicsChartSeries}
                            type="bar"
                            height={400}
                          />
                          <HStack justify="center" mt={4} spacing={6}>
                            <Stat textAlign="center" size="sm">
                              <StatLabel color="gray.600">Characteristics</StatLabel>
                              <StatNumber color="orange.600" fontSize="lg">
                                {characteristicsData.length}
                              </StatNumber>
                            </Stat>
                            <Stat textAlign="center" size="sm">
                              <StatLabel color="gray.600">Total Projects</StatLabel>
                              <StatNumber color="blue.600" fontSize="lg">
                                {characteristicsData.reduce((sum, item) => sum + item.projectCount, 0)}
                              </StatNumber>
                            </Stat>
                          </HStack>
                        </Box>
                      ) : (
                        <Flex justify="center" align="center" height="400px" direction="column">
                          <Icon as={FiActivity} size="48px" color="gray.300" mb={4} />
                          <Text color="gray.500" fontSize="sm" textAlign="center">
                            No characteristics data available
                          </Text>
                        </Flex>
                      )}
                    </CardBody>
                  </Card>
                </GridItem>

                {/* Project Type - 6 cols */}
                <GridItem colSpan={{ base: 12, md: 6 }}>
                  <Card rounded={radiusStyle} shadow="lg" bg="white" h="full">
                    <CardHeader bg="teal.500" color="white" roundedTop={radiusStyle}>
                      <Flex justify="space-between" align="center">
                        <HStack>
                          <Icon as={FiBarChart} />
                          <Text fontSize="md" fontWeight="bold">
                            Project Type
                          </Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            onClick={loadProjectTypeData}
                            isLoading={isLoading}
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            <FiRefreshCw />
                          </Button>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            Details
                          </Button>
                        </HStack>
                      </Flex>
                    </CardHeader>
                    <CardBody p={4}>
                      {projectTypeData.length > 0 ? (
                        <Box>
                          <Chart
                            options={projectTypeChartOptions}
                            series={projectTypeChartSeries}
                            type="pie"
                            height={400}
                          />
                          <HStack justify="center" mt={4} spacing={6}>
                            <Stat textAlign="center" size="sm">
                              <StatLabel color="gray.600">Types</StatLabel>
                              <StatNumber color="teal.600" fontSize="lg">
                                {projectTypeData.length}
                              </StatNumber>
                            </Stat>
                            <Stat textAlign="center" size="sm">
                              <StatLabel color="gray.600">Total Projects</StatLabel>
                              <StatNumber color="teal.600" fontSize="lg">
                                {projectTypeData.reduce((sum, item) => sum + item.projectCount, 0)}
                              </StatNumber>
                            </Stat>
                          </HStack>
                        </Box>
                      ) : (
                        <Flex justify="center" align="center" height="400px" direction="column">
                          <Icon as={FiBarChart} size="48px" color="gray.300" mb={4} />
                          <Text color="gray.500" fontSize="sm" textAlign="center">
                            No project type data available
                          </Text>
                        </Flex>
                      )}
                    </CardBody>
                  </Card>
                </GridItem>

                {/* Project Procurement Work Program Flag - 5 cols */}
                <GridItem colSpan={{ base: 12, md: 6, lg: 5 }}>
                  <Card rounded={radiusStyle} shadow="lg" bg="white" h="full">
                    <CardHeader bg="pink.500" color="white" roundedTop={radiusStyle}>
                      <Flex justify="space-between" align="center">
                        <HStack>
                          <Icon as={FiTrendingUp} />
                          <Text fontSize="md" fontWeight="bold">
                            Procurement Work Program
                          </Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            onClick={loadProcurementWorkProgramData}
                            isLoading={isLoading}
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            <FiRefreshCw />
                          </Button>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            Details
                          </Button>
                        </HStack>
                      </Flex>
                    </CardHeader>
                    <CardBody p={4}>
                      {procurementWorkProgramData.length > 0 ? (
                        <Box>
                          <Chart
                            options={procurementWorkProgramChartOptions}
                            series={procurementWorkProgramChartSeries}
                            type="donut"
                            height={400}
                          />
                          <HStack justify="center" mt={4} spacing={6}>
                            <Stat textAlign="center" size="sm">
                              <StatLabel color="gray.600">Categories</StatLabel>
                              <StatNumber color="pink.600" fontSize="lg">
                                {procurementWorkProgramData.length}
                              </StatNumber>
                            </Stat>
                            <Stat textAlign="center" size="sm">
                              <StatLabel color="gray.600">Total Projects</StatLabel>
                              <StatNumber color="pink.600" fontSize="lg">
                                {procurementWorkProgramData.reduce((sum, item) => sum + item.projectCount, 0)}
                              </StatNumber>
                            </Stat>
                          </HStack>
                        </Box>
                      ) : (
                        <Flex justify="center" align="center" height="400px" direction="column">
                          <Icon as={FiTrendingUp} size="48px" color="gray.300" mb={4} />
                          <Text color="gray.500" fontSize="sm" textAlign="center">
                            No procurement work program data available
                          </Text>
                        </Flex>
                      )}
                    </CardBody>
                  </Card>
                </GridItem>

                {/* Project Acquisitions - 7 cols */}
                <GridItem colSpan={{ base: 12, md: 6, lg: 7 }}>
                  <Card rounded={radiusStyle} shadow="lg" bg="white" h="full">
                    <CardHeader bg="cyan.500" color="white" roundedTop={radiusStyle}>
                      <Flex justify="space-between" align="center">
                        <HStack>
                          <Icon as={FiActivity} />
                          <Text fontSize="md" fontWeight="bold">
                            Project Acquisitions
                          </Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            onClick={loadProjectAcquisitionsData}
                            isLoading={isLoading}
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            <FiRefreshCw />
                          </Button>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            Details
                          </Button>
                        </HStack>
                      </Flex>
                    </CardHeader>
                    <CardBody p={4}>
                      {projectAcquisitionsData.length > 0 ? (
                        <Box>
                          <Chart
                            options={projectAcquisitionsChartOptions}
                            series={projectAcquisitionsChartSeries}
                            type="bar"
                            height={400}
                          />
                          <HStack justify="center" mt={4} spacing={6}>
                            <Stat textAlign="center" size="sm">
                              <StatLabel color="gray.600">Acquisitions</StatLabel>
                              <StatNumber color="cyan.600" fontSize="lg">
                                {projectAcquisitionsData.length}
                              </StatNumber>
                            </Stat>
                            <Stat textAlign="center" size="sm">
                              <StatLabel color="gray.600">Total Projects</StatLabel>
                              <StatNumber color="cyan.600" fontSize="lg">
                                {projectAcquisitionsData.reduce((sum, item) => sum + item.projectCount, 0)}
                              </StatNumber>
                            </Stat>
                          </HStack>
                        </Box>
                      ) : (
                        <Flex justify="center" align="center" height="400px" direction="column">
                          <Icon as={FiActivity} size="48px" color="gray.300" mb={4} />
                          <Text color="gray.500" fontSize="sm" textAlign="center">
                            No project acquisitions data available
                          </Text>
                        </Flex>
                      )}
                    </CardBody>
                  </Card>
                </GridItem>

                {/* Project by Group Management - 12 cols */}
                <GridItem colSpan={12}>
                  <Card rounded={radiusStyle} shadow="lg" bg="white" h="full">
                    <CardHeader bg="indigo.500" color="white" roundedTop={radiusStyle}>
                      <Flex justify="space-between" align="center">
                        <HStack>
                          <Icon as={FiBarChart} />
                          <Text fontSize="md" fontWeight="bold">
                            Project by Group Management
                          </Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            <FiRefreshCw />
                          </Button>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            Details
                          </Button>
                        </HStack>
                      </Flex>
                    </CardHeader>
                    <CardBody p={4}>
                      <Flex justify="center" align="center" height="300px" direction="column">
                        <Icon as={FiActivity} size="48px" color="gray.300" mb={4} />
                        <Text color="gray.500" fontSize="sm" textAlign="center">
                          Coming Soon
                        </Text>
                      </Flex>
                    </CardBody>
                  </Card>
                </GridItem>
              </Grid>
            </TabPanel>
            
            <TabPanel p={0}>
              <Card rounded={radiusStyle} shadow="xl" bg="white" minH="500px">
                <CardBody>
                  <Flex direction="column" justify="center" align="center" height="400px">
                    <Icon as={FiActivity} size="64px" color="gray.300" mb={6} />
                    <Text fontSize="xl" fontWeight="bold" color="gray.600" mb={2}>
                      Special Dashboard
                    </Text>
                    <Text color="gray.500" textAlign="center" maxW="md">
                      Advanced analytics and specialized reports will be available here. 
                      Stay tuned for enhanced features and insights.
                    </Text>
                  </Flex>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </LayoutAdmin>
  );
}
