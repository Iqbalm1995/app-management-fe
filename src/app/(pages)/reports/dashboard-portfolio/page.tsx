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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getCurrentQuarter, convertQuarterToDateRange } from "@/app/helper/MasterHelper";
import useSnapshotServices, { DashboardFilterRequest, ProjectSummaryDashboardResponse, ProjectQuarterlyDashboardResponse, DivisionOwnerQuartileDashboardResponse, ProjectCharacteristicsDashboardResponse, ProjectTypeDashboardResponse, ProcurementWorkProgramDashboardResponse, ProjectAcquisitionsDashboardResponse, ProjectByGroupManageDashboardResponse, DevStaffProjectClosedDashboardResponse, DevStaffProjectActiveDashboardResponse } from "@/app/services/useSnapshotServices";
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
  const [projectByGroupManageData, setProjectByGroupManageData] = useState<ProjectByGroupManageDashboardResponse[]>([]);
  const [projectSummaryDevData, setProjectSummaryDevData] = useState<ProjectSummaryDashboardResponse[]>([]);
  const [devStaffProjectClosedData, setDevStaffProjectClosedData] = useState<DevStaffProjectClosedDashboardResponse[]>([]);
  const [devStaffModalData, setDevStaffModalData] = useState<DevStaffProjectClosedDashboardResponse[]>([]);
  const [isDevStaffModalOpen, setIsDevStaffModalOpen] = useState(false);
  const [devStaffProjectActiveData, setDevStaffProjectActiveData] = useState<DevStaffProjectActiveDashboardResponse[]>([]);
  const [devStaffActiveModalData, setDevStaffActiveModalData] = useState<DevStaffProjectActiveDashboardResponse[]>([]);
  const [isDevStaffActiveModalOpen, setIsDevStaffActiveModalOpen] = useState(false);
  const [isProjectSummaryModalOpen, setIsProjectSummaryModalOpen] = useState(false);
  const [isProjectQuarterlyModalOpen, setIsProjectQuarterlyModalOpen] = useState(false);
  const [isDivisionModalOpen, setIsDivisionModalOpen] = useState(false);
  const [divisionModalData, setDivisionModalData] = useState<DivisionOwnerQuartileDashboardResponse[]>([]);
  const [isCharacteristicsModalOpen, setIsCharacteristicsModalOpen] = useState(false);
  const [characteristicsModalData, setCharacteristicsModalData] = useState<ProjectCharacteristicsDashboardResponse[]>([]);
  const [isProjectTypeModalOpen, setIsProjectTypeModalOpen] = useState(false);
  const [projectTypeModalData, setProjectTypeModalData] = useState<ProjectTypeDashboardResponse[]>([]);
  const [isProcurementModalOpen, setIsProcurementModalOpen] = useState(false);
  const [procurementModalData, setProcurementModalData] = useState<ProcurementWorkProgramDashboardResponse[]>([]);
  const [isAcquisitionsModalOpen, setIsAcquisitionsModalOpen] = useState(false);
  const [acquisitionsModalData, setAcquisitionsModalData] = useState<ProjectAcquisitionsDashboardResponse[]>([]);
  const [isGroupManageModalOpen, setIsGroupManageModalOpen] = useState(false);
  const [groupManageModalData, setGroupManageModalData] = useState<ProjectByGroupManageDashboardResponse[]>([]);
  const [isProjectSummaryDevModalOpen, setIsProjectSummaryDevModalOpen] = useState(false);
  const [projectSummaryDevModalData, setProjectSummaryDevModalData] = useState<ProjectSummaryDashboardResponse[]>([]);
  const [isUpdateConfirmOpen, setIsUpdateConfirmOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [tokenData, setTokenData] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  const { 
    getProjectSummaryDashboard, 
    getProjectQuarterlyDashboard, 
    getDivisionOwnerQuartileDashboard, 
    getProjectCharacteristicsDashboard, 
    getProjectTypeDashboard, 
    getProcurementWorkProgramDashboard, 
    getProjectAcquisitionsDashboard, 
    getProjectByGroupManageDashboard, 
    getDevStaffProjectClosedDashboard, 
    getDevStaffProjectActiveDashboard,
    projectSummary,
    projectCharacteristic,
    projectType,
    projectProcurementFlag,
    projectAcquisition,
    projectByGroupManage,
    projectQuartal,
    projectDivisionOwnerQuartal,
    userProjectClosedQuartal,
    userProjectActiveQuartal,
    isLoading, 
    error 
  } = useSnapshotServices();
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

  // Format group name for display
  const formatGroupName = (name: string): string => {
    // Handle Unknown case
    if (name === "Unknown") {
      return "UNK";
    }
    
    // Remove "GROUP" or "GRUP" from the name
    let formatted = name.replace(/\b(GROUP|GRUP)\b/gi, '').trim();
    
    // Split into words
    const words = formatted.split(/\s+/);
    
    // Handle special case for "DIGITAL"
    const initials = words.map(word => {
      if (word.toUpperCase() === 'DIGITAL') {
        return 'DG';
      }
      return word.charAt(0).toUpperCase();
    }).join('');
    
    return initials;
  };

  // Load project by group manage data
  const loadProjectByGroupManageData = async () => {
    if (!tokenData) return;

    const dateRange = convertQuarterToDateRange(parseInt(selectedYear), `Q${selectedQuarter}`);
    const filterPayload: DashboardFilterRequest = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    };

    try {
      const response = await getProjectByGroupManageDashboard(filterPayload, tokenData);
      const apiData = response?.data || [];
      
      // Randomize and limit to 5 groups
      let randomizedData = [...apiData].sort(() => Math.random() - 0.5).slice(0, 5);
      
      setProjectByGroupManageData(randomizedData);
    } catch (err) {
      console.error("Failed to load project by group manage data:", err);
    }
  };

  // Load project summary dev data (same as project summary but for dev)
  const loadProjectSummaryDevData = async () => {
    if (!tokenData) return;

    const dateRange = convertQuarterToDateRange(parseInt(selectedYear), `Q${selectedQuarter}`);
    const filterPayload: DashboardFilterRequest = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    };

    try {
      const response = await getProjectSummaryDashboard(filterPayload, tokenData);
      const apiData = response?.data || [];
      
      setProjectSummaryDevData(apiData);
    } catch (err) {
      console.error("Failed to load project summary dev data:", err);
    }
  };

  // Load dev staff project closed data
  const loadDevStaffProjectClosedData = async () => {
    if (!tokenData) return;

    const dateRange = convertQuarterToDateRange(parseInt(selectedYear), `Q${selectedQuarter}`);
    const filterPayload: DashboardFilterRequest = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    };

    try {
      const response = await getDevStaffProjectClosedDashboard(filterPayload, tokenData);
      const apiData = response?.data || [];
      
      // Group by users first, then randomize users and limit to 5
      const userGroups = apiData.reduce((acc, item) => {
        if (!acc[item.userFullName]) {
          acc[item.userFullName] = [];
        }
        acc[item.userFullName].push(item);
        return acc;
      }, {} as Record<string, typeof apiData>);
      
      // Get random 5 users
      const userNames = Object.keys(userGroups);
      const randomUsers = [...userNames].sort(() => Math.random() - 0.5).slice(0, 5);
      
      // Get all records for these 5 users
      const randomizedData = randomUsers.flatMap(userName => userGroups[userName]);
      
      setDevStaffProjectClosedData(randomizedData);
    } catch (err) {
      console.error("Failed to load dev staff project closed data:", err);
    }
  };

  // Load all dev staff project closed data for modal (current filter)
  const loadAllDevStaffProjectClosedData = async () => {
    if (!tokenData) return;

    // Use same date range as current filter
    const dateRange = convertQuarterToDateRange(parseInt(selectedYear), `Q${selectedQuarter}`);
    const filterPayload: DashboardFilterRequest = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    };

    try {
      const response = await getDevStaffProjectClosedDashboard(filterPayload, tokenData);
      const apiData = response?.data || [];
      
      setDevStaffModalData(apiData);
      setIsDevStaffModalOpen(true);
    } catch (err) {
      console.error("Failed to load all dev staff project closed data:", err);
    }
  };

  // Load dev staff project active data
  const loadDevStaffProjectActiveData = async () => {
    if (!tokenData) return;

    const dateRange = convertQuarterToDateRange(parseInt(selectedYear), `Q${selectedQuarter}`);
    const filterPayload: DashboardFilterRequest = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    };

    try {
      const response = await getDevStaffProjectActiveDashboard(filterPayload, tokenData);
      const apiData = response?.data || [];
      
      // Group by users first, then randomize users and limit to 5
      const userGroups = apiData.reduce((acc, item) => {
        if (!acc[item.userFullName]) {
          acc[item.userFullName] = [];
        }
        acc[item.userFullName].push(item);
        return acc;
      }, {} as Record<string, typeof apiData>);
      
      // Get random 5 users
      const userNames = Object.keys(userGroups);
      const randomUsers = [...userNames].sort(() => Math.random() - 0.5).slice(0, 5);
      
      // Get all records for these 5 users
      const randomizedData = randomUsers.flatMap(userName => userGroups[userName]);
      
      setDevStaffProjectActiveData(randomizedData);
    } catch (err) {
      console.error("Failed to load dev staff project active data:", err);
    }
  };

  // Load all dev staff project active data for modal
  const loadAllDevStaffProjectActiveData = async () => {
    if (!tokenData) return;

    // Use same date range as current filter
    const dateRange = convertQuarterToDateRange(parseInt(selectedYear), `Q${selectedQuarter}`);
    const filterPayload: DashboardFilterRequest = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    };

    try {
      const response = await getDevStaffProjectActiveDashboard(filterPayload, tokenData);
      const apiData = response?.data || [];
      
      setDevStaffActiveModalData(apiData);
      setIsDevStaffActiveModalOpen(true);
    } catch (err) {
      console.error("Failed to load all dev staff project active data:", err);
    }
  };

  // Load all project summary data for modal
  const loadAllProjectSummaryData = () => {
    // Uses current chartData which is already filtered by current quarter/year
    setIsProjectSummaryModalOpen(true);
  };

  // Load all project quarterly data for modal
  const loadAllProjectQuarterlyData = () => {
    // Uses current quarterlyData which is already filtered by current quarter/year
    setIsProjectQuarterlyModalOpen(true);
  };

  // Load all division owner quartile data for modal (unlimited)
  const loadAllDivisionData = async () => {
    if (!tokenData) return;

    const dateRange = convertQuarterToDateRange(parseInt(selectedYear), `Q${selectedQuarter}`);
    const filterPayload: DashboardFilterRequest = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };

    try {
      const response = await getDivisionOwnerQuartileDashboard(filterPayload, tokenData);
      const apiData = response?.data || [];
      
      // Get ALL unique divisions (no limit, no randomization for modal)
      const quarterMonths = getQuarterMonths(selectedQuarter);
      let uniqueDivisions = [...new Set(apiData.map(item => item.divisionName))];
      
      const completeData: DivisionOwnerQuartileDashboardResponse[] = [];
      
      // Create complete data structure for all divisions
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
        uniqueDivisions.forEach(divisionName => {
          quarterMonths.forEach(({ monthPeriod, monthName }) => {
            const existingData = apiData.find(item => 
              item.divisionName === divisionName && item.monthPeriod === monthPeriod
            );
            
            completeData.push({
              divisionName,
              monthPeriod,
              monthName,
              projectCount: existingData?.projectCount || 0,
              yearPeriod: parseInt(selectedYear),
              quartalPeriod: parseInt(selectedQuarter)
            });
          });
        });
      }
      
      setDivisionModalData(completeData);
      setIsDivisionModalOpen(true);
    } catch (err) {
      console.error("Failed to load all division data:", err);
    }
  };

  // Load all project characteristics data for modal (unlimited)
  const loadAllCharacteristicsData = async () => {
    if (!tokenData) return;

    const dateRange = convertQuarterToDateRange(parseInt(selectedYear), `Q${selectedQuarter}`);
    const filterPayload: DashboardFilterRequest = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };

    try {
      const response = await getProjectCharacteristicsDashboard(filterPayload, tokenData);
      const apiData = response?.data || [];
      
      setCharacteristicsModalData(apiData);
      setIsCharacteristicsModalOpen(true);
    } catch (err) {
      console.error("Failed to load all characteristics data:", err);
    }
  };

  // Load all project type data for modal (unlimited)
  const loadAllProjectTypeData = async () => {
    if (!tokenData) return;

    const dateRange = convertQuarterToDateRange(parseInt(selectedYear), `Q${selectedQuarter}`);
    const filterPayload: DashboardFilterRequest = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };

    try {
      const response = await getProjectTypeDashboard(filterPayload, tokenData);
      const apiData = response?.data || [];
      
      setProjectTypeModalData(apiData);
      setIsProjectTypeModalOpen(true);
    } catch (err) {
      console.error("Failed to load all project type data:", err);
    }
  };

  // Load all procurement work program data for modal (unlimited)
  const loadAllProcurementData = async () => {
    if (!tokenData) return;

    const dateRange = convertQuarterToDateRange(parseInt(selectedYear), `Q${selectedQuarter}`);
    const filterPayload: DashboardFilterRequest = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };

    try {
      const response = await getProcurementWorkProgramDashboard(filterPayload, tokenData);
      const apiData = response?.data || [];
      
      setProcurementModalData(apiData);
      setIsProcurementModalOpen(true);
    } catch (err) {
      console.error("Failed to load all procurement data:", err);
    }
  };

  // Load all project acquisitions data for modal (unlimited)
  const loadAllAcquisitionsData = async () => {
    if (!tokenData) return;

    const dateRange = convertQuarterToDateRange(parseInt(selectedYear), `Q${selectedQuarter}`);
    const filterPayload: DashboardFilterRequest = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };

    try {
      const response = await getProjectAcquisitionsDashboard(filterPayload, tokenData);
      const apiData = response?.data || [];
      
      setAcquisitionsModalData(apiData);
      setIsAcquisitionsModalOpen(true);
    } catch (err) {
      console.error("Failed to load all acquisitions data:", err);
    }
  };

  // Load all project by group manage data for modal (unlimited)
  const loadAllGroupManageData = async () => {
    if (!tokenData) return;

    const dateRange = convertQuarterToDateRange(parseInt(selectedYear), `Q${selectedQuarter}`);
    const filterPayload: DashboardFilterRequest = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };

    try {
      const response = await getProjectByGroupManageDashboard(filterPayload, tokenData);
      const apiData = response?.data || [];
      
      setGroupManageModalData(apiData);
      setIsGroupManageModalOpen(true);
    } catch (err) {
      console.error("Failed to load all group manage data:", err);
    }
  };

  // Load all project summary dev data for modal (unlimited)
  const loadAllProjectSummaryDevData = async () => {
    if (!tokenData) return;

    const dateRange = convertQuarterToDateRange(parseInt(selectedYear), `Q${selectedQuarter}`);
    const filterPayload: DashboardFilterRequest = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };

    try {
      const response = await getProjectSummaryDashboard(filterPayload, tokenData);
      const apiData = response?.data || [];
      
      setProjectSummaryDevModalData(apiData);
      setIsProjectSummaryDevModalOpen(true);
    } catch (err) {
      console.error("Failed to load all project summary dev data:", err);
    }
  };

  // Handle update report with all snapshot calls
  const handleUpdateReport = async () => {
    if (!tokenData) {
      toast({
        title: "Authentication Error",
        description: "Please login to update reports",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsUpdating(true);
    setUpdateProgress(0);
    setIsUpdateConfirmOpen(false);

    const snapshotCalls = [
      { name: 'Project Summary', call: () => projectSummary(tokenData) },
      { name: 'Project Characteristics', call: () => projectCharacteristic(tokenData) },
      { name: 'Project Type', call: () => projectType(tokenData) },
      { name: 'Procurement Work Program', call: () => projectProcurementFlag(tokenData) },
      { name: 'Project Acquisitions', call: () => projectAcquisition(tokenData) },
      { name: 'Project by Group Manage', call: () => projectByGroupManage(tokenData) },
      { name: 'Project Quarterly', call: () => projectQuartal(tokenData) },
      { name: 'Division Owner Quartile', call: () => projectDivisionOwnerQuartal(tokenData) },
      { name: 'User Project Closed', call: () => userProjectClosedQuartal(tokenData) },
      { name: 'User Project Active', call: () => userProjectActiveQuartal(tokenData) },
    ];

    let successCount = 0;
    let failedCount = 0;

    try {
      // Minimum 3 seconds loading
      const startTime = Date.now();

      for (let i = 0; i < snapshotCalls.length; i++) {
        const { name, call } = snapshotCalls[i];
        setUpdateStatus(`Updating ${name}...`);
        
        try {
          await call();
          successCount++;
          toast({
            title: `${name} Updated`,
            description: `Successfully updated ${name} data`,
            status: "success",
            duration: 2000,
            isClosable: true,
          });
        } catch (error) {
          failedCount++;
          console.error(`Failed to update ${name}:`, error);
          toast({
            title: `${name} Update Failed`,
            description: `Failed to update ${name} data`,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }

        setUpdateProgress(((i + 1) / snapshotCalls.length) * 100);
        
        // Small delay between calls
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Ensure minimum 3 seconds loading time
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 3000) {
        await new Promise(resolve => setTimeout(resolve, 3000 - elapsedTime));
      }

      // Final status
      if (failedCount === 0) {
        toast({
          title: "Report Update Complete",
          description: `Successfully updated all ${successCount} report snapshots`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Report Update Completed with Errors",
          description: `Updated ${successCount} reports, ${failedCount} failed`,
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }

      // Refresh dashboard data after update
      await handleFilter();

    } catch (error) {
      console.error("Update report failed:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update report data. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
      setUpdateProgress(0);
      setUpdateStatus('');
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

  // Update project by group manage data when quarter/year changes
  useEffect(() => {
    if (tokenData) {
      loadProjectByGroupManageData();
    }
  }, [selectedQuarter, selectedYear, tokenData]);

  // Update project summary dev data when quarter/year changes
  useEffect(() => {
    if (tokenData) {
      loadProjectSummaryDevData();
    }
  }, [selectedQuarter, selectedYear, tokenData]);

  // Update dev staff project closed data when quarter/year changes
  useEffect(() => {
    if (tokenData) {
      loadDevStaffProjectClosedData();
    }
  }, [selectedQuarter, selectedYear, tokenData]);

  // Update dev staff project active data when quarter/year changes
  useEffect(() => {
    if (tokenData) {
      loadDevStaffProjectActiveData();
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
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false
      }
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
      title: { text: 'Project Count' },
      categories: projectAcquisitionsData.map(item => item.projectAcquisitionName)
    },
    yaxis: {
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

  // Project by Group Manage Bar Chart Configuration (horizontal)
  const projectByGroupManageChartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 400,
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false
      }
    },
    colors: ['#ED8936', '#38B2AC', '#3182CE', '#805AD5', '#D69E2E'],
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
      title: { text: 'Project Count' },
      categories: projectByGroupManageData.map(item => formatGroupName(item.projectGroupNameManage))
    },
    yaxis: {
      labels: {
        style: { fontSize: '12px' }
      }
    },
    legend: { show: false },
    tooltip: {
      y: { formatter: (val: number) => `${val} projects` },
      x: {
        formatter: (val: any, opts: any) => {
          const index = opts.dataPointIndex;
          return projectByGroupManageData[index]?.projectGroupNameManage || 'Unknown';
        }
      }
    }
  };

  const projectByGroupManageChartSeries = [{
    name: 'Projects',
    data: projectByGroupManageData.map(item => item.projectCount)
  }];

  // Project Summary Dev Donut Chart Configuration (Active vs Closed)
  const activeProjects = projectSummaryDevData.filter(item => {
    const status = item.projectStatus?.toUpperCase();
    return status?.includes('ACTIVE') || status?.includes('INITIATE') || status?.includes('PROGRESS') || status?.includes('PLANNING');
  });
  const closedProjects = projectSummaryDevData.filter(item => {
    const status = item.projectStatus?.toUpperCase();
    return status?.includes('CLOSED') || status?.includes('COMPLETED') || status?.includes('CANCELLED');
  });
  const activeCount = activeProjects.reduce((sum, item) => sum + item.projectCount, 0);
  const closedCount = closedProjects.reduce((sum, item) => sum + item.projectCount, 0);

  // Debug: Log the data to see the structure
  console.log('Project Summary Dev Data:', projectSummaryDevData);
  console.log('Active Count:', activeCount, 'Closed Count:', closedCount);

  const projectSummaryDevChartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      height: 300,
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false
      }
    },
    colors: ['#38A169', '#E53E3E'],
    labels: ['Active', 'Closed'],
    dataLabels: {
      enabled: true,
      formatter: (val: number) => {
        return Math.round(val) + '%';
      }
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Projects',
              formatter: () => `${activeCount + closedCount}`
            }
          }
        }
      }
    },
    legend: {
      position: 'bottom'
    },
    tooltip: {
      y: { formatter: (val: number) => `${val} projects` }
    }
  };

  const projectSummaryDevChartSeries = [activeCount, closedCount];

  // Dev Staff Project Closed Chart Configuration (same as Division Owner Quartile)
  const devStaffCategories = [...new Set(devStaffProjectClosedData.map(item => item.userFullName))];
  const quarterMonths = getQuarterMonths(selectedQuarter);

  const devStaffProjectClosedChartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 300,
      stacked: true,
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false
      }
    },
    colors: ['#ED8936', '#38B2AC', '#3182CE'],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        dataLabels: {
          position: 'center'
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: devStaffCategories,
      labels: {
        style: {
          fontSize: '10px'
        }
      },
      title: {
        text: 'Project Count'
      }
    },
    yaxis: {
      title: {
        text: 'User Full Name'
      }
    },
    fill: {
      opacity: 1
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
    },
    tooltip: {
      shared: false,
      intersect: true,
      y: {
        formatter: (val: number, opts: any) => {
          const seriesIndex = opts.seriesIndex;
          const dataPointIndex = opts.dataPointIndex;
          const monthName = quarterMonths[seriesIndex]?.monthName || '';
          const userFullName = devStaffCategories[dataPointIndex] || '';
          return `${monthName}: ${val} projects<br/>User: ${userFullName}`;
        }
      }
    }
  };

  // Helper function to get full month name
  const getFullMonthName = (monthNumber: number): string => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNumber - 1] || monthNumber.toString();
  };

  const devStaffProjectClosedChartSeries = quarterMonths.map(month => {
    const seriesData = devStaffCategories.map(user => {
      const userMonthData = devStaffProjectClosedData.find(
        item => item.userFullName === user && (
          item.monthName === month.monthName ||
          item.monthName === getFullMonthName(month.monthPeriod) ||
          item.monthName === month.monthPeriod.toString().padStart(2, '0') ||
          item.monthName === month.monthPeriod.toString()
        )
      );
      return userMonthData ? userMonthData.projectCount : 0;
    });
    
    return {
      name: month.monthName,
      data: seriesData
    };
  });

  // Dev Staff Project Active Chart Configuration (same as Dev Staff Project Closed)
  const devStaffActiveCategories = [...new Set(devStaffProjectActiveData.map(item => item.userFullName))];
  const quarterMonthsActive = getQuarterMonths(selectedQuarter);

  const devStaffProjectActiveChartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 300,
      stacked: true,
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false
      }
    },
    colors: ['#38A169', '#68D391', '#9AE6B4'],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        dataLabels: {
          position: 'center'
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: devStaffActiveCategories,
      labels: {
        style: {
          fontSize: '10px'
        }
      },
      title: {
        text: 'Project Count'
      }
    },
    yaxis: {
      title: {
        text: 'User Full Name'
      }
    },
    fill: {
      opacity: 1
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
    },
    tooltip: {
      shared: false,
      intersect: true,
      y: {
        formatter: (val: number, opts: any) => {
          const seriesIndex = opts.seriesIndex;
          const dataPointIndex = opts.dataPointIndex;
          const monthName = quarterMonthsActive[seriesIndex]?.monthName || '';
          const userFullName = devStaffActiveCategories[dataPointIndex] || '';
          return `${monthName}: ${val} projects<br/>User: ${userFullName}`;
        }
      }
    }
  };

  const devStaffProjectActiveChartSeries = quarterMonthsActive.map(month => {
    const seriesData = devStaffActiveCategories.map(user => {
      const userMonthData = devStaffProjectActiveData.find(
        item => item.userFullName === user && (
          item.monthName === month.monthName ||
          item.monthName === getFullMonthName(month.monthPeriod) ||
          item.monthName === month.monthPeriod.toString().padStart(2, '0') ||
          item.monthName === month.monthPeriod.toString()
        )
      );
      return userMonthData ? userMonthData.projectCount : 0;
    });
    
    return {
      name: month.monthName,
      data: seriesData
    };
  });

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
        <Tabs variant="soft-rounded" colorScheme="blue">
          {/* Filter Controls */}
          <Card mb={6} rounded={radiusStyle} shadow="lg" bg="white">
            <CardBody>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
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
                
                <VStack spacing={1} align="start">
                  <Text fontSize="xs" color="transparent">Update</Text>
                  <Button 
                    colorScheme="orange" 
                    onClick={() => setIsUpdateConfirmOpen(true)}
                    isLoading={isUpdating}
                    loadingText="Updating..."
                    size="sm"
                    rounded={radiusStyle}
                    leftIcon={<FiActivity />}
                    _hover={{ transform: "translateY(-1px)", shadow: "md" }}
                    transition="all 0.2s"
                  >
                    Update Report
                  </Button>
                </VStack>
              </HStack>
            </Flex>
          </CardBody>
        </Card>

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
                            onClick={loadAllProjectSummaryData}
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
                            onClick={loadAllProjectQuarterlyData}
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
                            onClick={loadAllDivisionData}
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
                            onClick={loadAllCharacteristicsData}
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
                            onClick={loadAllProjectTypeData}
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
                            onClick={loadAllProcurementData}
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
                            onClick={loadAllAcquisitionsData}
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
                    <CardHeader bg="purple.500" color="white" roundedTop={radiusStyle}>
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
                            onClick={loadProjectByGroupManageData}
                            isLoading={isLoading}
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            <FiRefreshCw />
                          </Button>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            onClick={loadAllGroupManageData}
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            Details
                          </Button>
                        </HStack>
                      </Flex>
                    </CardHeader>
                    <CardBody p={4}>
                      {projectByGroupManageData.length > 0 ? (
                        <Box>
                          <Chart
                            options={projectByGroupManageChartOptions}
                            series={projectByGroupManageChartSeries}
                            type="bar"
                            height={400}
                          />
                          <HStack justify="center" mt={4} spacing={6}>
                            <Stat textAlign="center" size="sm">
                              <StatLabel color="gray.600">Groups</StatLabel>
                              <StatNumber color="purple.600" fontSize="lg">
                                {projectByGroupManageData.length}
                              </StatNumber>
                            </Stat>
                            <Stat textAlign="center" size="sm">
                              <StatLabel color="gray.600">Total Projects</StatLabel>
                              <StatNumber color="purple.600" fontSize="lg">
                                {projectByGroupManageData.reduce((sum, item) => sum + item.projectCount, 0)}
                              </StatNumber>
                            </Stat>
                          </HStack>
                        </Box>
                      ) : (
                        <Flex justify="center" align="center" height="400px" direction="column">
                          <Icon as={FiBarChart} size="48px" color="gray.300" mb={4} />
                          <Text color="gray.500" fontSize="sm" textAlign="center">
                            No project by group management data available
                          </Text>
                        </Flex>
                      )}
                    </CardBody>
                  </Card>
                </GridItem>
              </Grid>
            </TabPanel>
            
            <TabPanel p={0}>
              {/* 12-Column Grid Layout for Special Dashboard */}
              <Grid 
                templateColumns="repeat(12, 1fr)" 
                gap={6}
                autoRows="min-content"
              >
                {/* Project Summary Dev - 4 cols */}
                <GridItem colSpan={{ base: 12, md: 6, lg: 4 }}>
                  <Card rounded={radiusStyle} shadow="lg" bg="white" h="full">
                    <CardHeader bg="blue.500" color="white" roundedTop={radiusStyle}>
                      <Flex justify="space-between" align="center">
                        <HStack>
                          <Icon as={FiBarChart} />
                          <Text fontSize="md" fontWeight="bold">
                            Project Summary Dev
                          </Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            onClick={loadProjectSummaryDevData}
                            isLoading={isLoading}
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            <FiRefreshCw />
                          </Button>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            onClick={loadAllProjectSummaryDevData}
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            Details
                          </Button>
                        </HStack>
                      </Flex>
                    </CardHeader>
                    <CardBody p={4}>
                      {projectSummaryDevData.length > 0 ? (
                        <Box>
                          <Chart
                            options={projectSummaryDevChartOptions}
                            series={projectSummaryDevChartSeries}
                            type="donut"
                            height={300}
                          />
                          <HStack justify="center" mt={4} spacing={6}>
                            <Stat textAlign="center" size="sm">
                              <StatLabel color="gray.600">Active</StatLabel>
                              <StatNumber color="green.600" fontSize="lg">
                                {activeCount}
                              </StatNumber>
                            </Stat>
                            <Stat textAlign="center" size="sm">
                              <StatLabel color="gray.600">Closed</StatLabel>
                              <StatNumber color="red.600" fontSize="lg">
                                {closedCount}
                              </StatNumber>
                            </Stat>
                          </HStack>
                        </Box>
                      ) : (
                        <Flex justify="center" align="center" height="300px" direction="column">
                          <Icon as={FiBarChart} size="48px" color="gray.300" mb={4} />
                          <Text color="gray.500" fontSize="sm" textAlign="center">
                            No project summary dev data available
                          </Text>
                        </Flex>
                      )}
                    </CardBody>
                  </Card>
                </GridItem>

                {/* Dev Staff Project Closed - 8 cols */}
                <GridItem colSpan={{ base: 12, md: 6, lg: 8 }}>
                  <Card rounded={radiusStyle} shadow="lg" bg="white" h="full">
                    <CardHeader bg="red.500" color="white" roundedTop={radiusStyle}>
                      <Flex justify="space-between" align="center">
                        <HStack>
                          <Icon as={FiBarChart} />
                          <Text fontSize="md" fontWeight="bold">
                            Dev Staff Project Closed
                          </Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            onClick={loadDevStaffProjectClosedData}
                            isLoading={isLoading}
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            <FiRefreshCw />
                          </Button>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            onClick={loadAllDevStaffProjectClosedData}
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            Details
                          </Button>
                        </HStack>
                      </Flex>
                    </CardHeader>
                    <CardBody p={4}>
                      {devStaffProjectClosedData.length > 0 ? (
                        <Box>
                          <Chart
                            options={devStaffProjectClosedChartOptions}
                            series={devStaffProjectClosedChartSeries}
                            type="bar"
                            height={300}
                          />
                          <HStack justify="center" mt={4} spacing={6}>
                            <Stat textAlign="center" size="sm">
                              <StatLabel color="gray.600">Q{selectedQuarter} Users</StatLabel>
                              <StatNumber color="red.600" fontSize="lg">
                                {devStaffCategories.length}
                              </StatNumber>
                            </Stat>
                          </HStack>
                        </Box>
                      ) : (
                        <Flex justify="center" align="center" height="300px" direction="column">
                          <Icon as={FiBarChart} size="48px" color="gray.300" mb={4} />
                          <Text color="gray.500" fontSize="sm" textAlign="center">
                            No dev staff project closed data available
                          </Text>
                        </Flex>
                      )}
                    </CardBody>
                  </Card>
                </GridItem>

                {/* Dev Staff Project Active - 12 cols */}
                <GridItem colSpan={12}>
                  <Card rounded={radiusStyle} shadow="lg" bg="white" h="full">
                    <CardHeader bg="green.500" color="white" roundedTop={radiusStyle}>
                      <Flex justify="space-between" align="center">
                        <HStack>
                          <Icon as={FiBarChart} />
                          <Text fontSize="md" fontWeight="bold">
                            Dev Staff Project Active
                          </Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            onClick={loadDevStaffProjectActiveData}
                            isLoading={isLoading}
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            <FiRefreshCw />
                          </Button>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="white"
                            onClick={loadAllDevStaffProjectActiveData}
                            _hover={{ bg: "whiteAlpha.200" }}
                          >
                            Details
                          </Button>
                        </HStack>
                      </Flex>
                    </CardHeader>
                    <CardBody p={4}>
                      {devStaffProjectActiveData.length > 0 ? (
                        <Box>
                          <Chart
                            options={devStaffProjectActiveChartOptions}
                            series={devStaffProjectActiveChartSeries}
                            type="bar"
                            height={300}
                          />
                          <HStack justify="center" mt={4} spacing={6}>
                            <Stat textAlign="center" size="sm">
                              <StatLabel color="gray.600">Q{selectedQuarter} Users</StatLabel>
                              <StatNumber color="green.600" fontSize="lg">
                                {devStaffActiveCategories.length}
                              </StatNumber>
                            </Stat>
                          </HStack>
                        </Box>
                      ) : (
                        <Flex justify="center" align="center" height="300px" direction="column">
                          <Icon as={FiBarChart} size="48px" color="gray.300" mb={4} />
                          <Text color="gray.500" fontSize="sm" textAlign="center">
                            No dev staff project active data available
                          </Text>
                        </Flex>
                      )}
                    </CardBody>
                  </Card>
                </GridItem>
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Dev Staff Project Closed Modal */}
        <Modal isOpen={isDevStaffModalOpen} onClose={() => setIsDevStaffModalOpen(false)} size="6xl">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent maxH="90vh" bg="white" shadow="2xl" rounded="xl">
            <ModalHeader 
              bg="red.500" 
              color="white" 
              roundedTop="xl" 
              py={4}
              fontSize="lg"
              fontWeight="bold"
            >
              <HStack>
                <Icon as={FiBarChart} />
                <Text>Dev Staff Project Closed - All Data (Q{selectedQuarter} {selectedYear})</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody overflowY="auto" maxH="70vh" p={6}>
              {devStaffModalData.length > 0 ? (
                <Box>
                  <Box bg="gray.50" p={4} rounded="lg" mb={4}>
                    <Chart
                      options={{
                        ...devStaffProjectClosedChartOptions,
                        xaxis: {
                          ...devStaffProjectClosedChartOptions.xaxis,
                          categories: [...new Set(devStaffModalData.map(item => item.userFullName))]
                        }
                      }}
                      series={getQuarterMonths(selectedQuarter).map(month => ({
                        name: month.monthName,
                        data: [...new Set(devStaffModalData.map(item => item.userFullName))].map(user => {
                          const userMonthData = devStaffModalData.find(
                            item => item.userFullName === user && (
                              item.monthName === month.monthName ||
                              item.monthName === getFullMonthName(month.monthPeriod) ||
                              item.monthName === month.monthPeriod.toString().padStart(2, '0') ||
                              item.monthName === month.monthPeriod.toString()
                            )
                          );
                          return userMonthData ? userMonthData.projectCount : 0;
                        })
                      }))}
                      type="bar"
                      height={Math.max(400, [...new Set(devStaffModalData.map(item => item.userFullName))].length * 30)}
                    />
                  </Box>
                  <HStack justify="center" mt={4} spacing={6}>
                    <Box bg="red.50" p={4} rounded="lg" textAlign="center">
                      <Stat>
                        <StatLabel color="red.600" fontSize="sm" fontWeight="medium">Total Users</StatLabel>
                        <StatNumber color="red.600" fontSize="2xl" fontWeight="bold">
                          {[...new Set(devStaffModalData.map(item => item.userFullName))].length}
                        </StatNumber>
                      </Stat>
                    </Box>
                  </HStack>
                </Box>
              ) : (
                <Flex justify="center" align="center" height="300px" direction="column">
                  <Icon as={FiBarChart} size="48px" color="gray.300" mb={4} />
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    No dev staff project closed data available
                  </Text>
                </Flex>
              )}
            </ModalBody>
            <ModalFooter bg="gray.50" roundedBottom="xl" py={4}>
              <Button colorScheme="red" mr={3} onClick={() => setIsDevStaffModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Dev Staff Project Active Modal */}
        <Modal isOpen={isDevStaffActiveModalOpen} onClose={() => setIsDevStaffActiveModalOpen(false)} size="6xl">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent maxH="90vh" bg="white" shadow="2xl" rounded="xl">
            <ModalHeader 
              bg="green.500" 
              color="white" 
              roundedTop="xl" 
              py={4}
              fontSize="lg"
              fontWeight="bold"
            >
              <HStack>
                <Icon as={FiBarChart} />
                <Text>Dev Staff Project Active - All Data (Q{selectedQuarter} {selectedYear})</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody overflowY="auto" maxH="70vh" p={6}>
              {devStaffActiveModalData.length > 0 ? (
                <Box>
                  <Box bg="gray.50" p={4} rounded="lg" mb={4}>
                    <Chart
                      options={{
                        ...devStaffProjectActiveChartOptions,
                        xaxis: {
                          ...devStaffProjectActiveChartOptions.xaxis,
                          categories: [...new Set(devStaffActiveModalData.map(item => item.userFullName))]
                        }
                      }}
                      series={getQuarterMonths(selectedQuarter).map(month => ({
                        name: month.monthName,
                        data: [...new Set(devStaffActiveModalData.map(item => item.userFullName))].map(user => {
                          const userMonthData = devStaffActiveModalData.find(
                            item => item.userFullName === user && (
                              item.monthName === month.monthName ||
                              item.monthName === getFullMonthName(month.monthPeriod) ||
                              item.monthName === month.monthPeriod.toString().padStart(2, '0') ||
                              item.monthName === month.monthPeriod.toString()
                            )
                          );
                          return userMonthData ? userMonthData.projectCount : 0;
                        })
                      }))}
                      type="bar"
                      height={Math.max(400, [...new Set(devStaffActiveModalData.map(item => item.userFullName))].length * 30)}
                    />
                  </Box>
                  <HStack justify="center" mt={4} spacing={6}>
                    <Box bg="green.50" p={4} rounded="lg" textAlign="center">
                      <Stat>
                        <StatLabel color="green.600" fontSize="sm" fontWeight="medium">Total Users</StatLabel>
                        <StatNumber color="green.600" fontSize="2xl" fontWeight="bold">
                          {[...new Set(devStaffActiveModalData.map(item => item.userFullName))].length}
                        </StatNumber>
                      </Stat>
                    </Box>
                  </HStack>
                </Box>
              ) : (
                <Flex justify="center" align="center" height="300px" direction="column">
                  <Icon as={FiBarChart} size="48px" color="gray.300" mb={4} />
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    No dev staff project active data available
                  </Text>
                </Flex>
              )}
            </ModalBody>
            <ModalFooter bg="gray.50" roundedBottom="xl" py={4}>
              <Button colorScheme="green" mr={3} onClick={() => setIsDevStaffActiveModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Division Owner Quartile Modal */}
        <Modal isOpen={isDivisionModalOpen} onClose={() => setIsDivisionModalOpen(false)} size="6xl">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent maxH="90vh" bg="white" shadow="2xl" rounded="xl">
            <ModalHeader 
              bg="purple.500" 
              color="white" 
              roundedTop="xl" 
              py={4}
              fontSize="lg"
              fontWeight="bold"
            >
              <HStack>
                <Icon as={FiTrendingUp} />
                <Text>Division Owner Quartile - All Data (Q{selectedQuarter} {selectedYear})</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody overflowY="auto" maxH="70vh" p={6}>
              {divisionModalData.length > 0 ? (
                <Box>
                  <Box bg="gray.50" p={4} rounded="lg" mb={4}>
                    <Chart
                      options={{
                        ...divisionChartOptions,
                        xaxis: {
                          ...divisionChartOptions.xaxis,
                          categories: [...new Set(divisionModalData.map(item => shortenDivisionName(item.divisionName)))]
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
                              const fullDivisionName = [...new Set(divisionModalData.map(item => item.divisionName))][dataPointIndex] || '';
                              return `${monthName}: ${val} projects<br/>Division: ${fullDivisionName}`;
                            }
                          }
                        }
                      }}
                      series={getQuarterMonths(selectedQuarter).map(({ monthName }) => ({
                        name: monthName || '',
                        data: [...new Set(divisionModalData.map(item => shortenDivisionName(item.divisionName)))].map(division => {
                          const divisionItem = divisionModalData.find(item => 
                            shortenDivisionName(item.divisionName) === division && item.monthName === monthName
                          );
                          return divisionItem?.projectCount || 0;
                        })
                      }))}
                      type="bar"
                      height={Math.max(400, [...new Set(divisionModalData.map(item => item.divisionName))].length * 30)}
                    />
                  </Box>
                  <HStack justify="center" mt={4} spacing={6}>
                    <Box bg="purple.50" p={4} rounded="lg" textAlign="center">
                      <Stat>
                        <StatLabel color="purple.600" fontSize="sm" fontWeight="medium">Total Divisions</StatLabel>
                        <StatNumber color="purple.600" fontSize="2xl" fontWeight="bold">
                          {[...new Set(divisionModalData.map(item => item.divisionName))].length}
                        </StatNumber>
                      </Stat>
                    </Box>
                  </HStack>
                </Box>
              ) : (
                <Flex justify="center" align="center" height="300px" direction="column">
                  <Icon as={FiTrendingUp} size="48px" color="gray.300" mb={4} />
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    No division owner quartile data available
                  </Text>
                </Flex>
              )}
            </ModalBody>
            <ModalFooter bg="gray.50" roundedBottom="xl" py={4}>
              <Button colorScheme="purple" mr={3} onClick={() => setIsDivisionModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Project Quarterly Modal */}
        <Modal isOpen={isProjectQuarterlyModalOpen} onClose={() => setIsProjectQuarterlyModalOpen(false)} size="6xl">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent maxH="90vh" bg="white" shadow="2xl" rounded="xl">
            <ModalHeader 
              bg="purple.500" 
              color="white" 
              roundedTop="xl" 
              py={4}
              fontSize="lg"
              fontWeight="bold"
            >
              <HStack>
                <Icon as={FiActivity} />
                <Text>Project Quarterly - All Data (Q{selectedQuarter} {selectedYear})</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody overflowY="auto" maxH="70vh" p={6}>
              {quarterlyData.length > 0 ? (
                <Box>
                  <Box bg="gray.50" p={4} rounded="lg" mb={4}>
                    <Chart
                      options={quarterlyChartOptions}
                      series={quarterlyChartSeries}
                      type="bar"
                      height={400}
                    />
                  </Box>
                  <HStack justify="center" mt={4} spacing={6}>
                    <Box bg="purple.50" p={4} rounded="lg" textAlign="center">
                      <Stat>
                        <StatLabel color="purple.600" fontSize="sm" fontWeight="medium">Total Projects</StatLabel>
                        <StatNumber color="purple.600" fontSize="2xl" fontWeight="bold">
                          {quarterlyData.reduce((sum, item) => sum + item.projectCount, 0)}
                        </StatNumber>
                      </Stat>
                    </Box>
                  </HStack>
                </Box>
              ) : (
                <Flex justify="center" align="center" height="300px" direction="column">
                  <Icon as={FiActivity} size="48px" color="gray.300" mb={4} />
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    No project quarterly data available
                  </Text>
                </Flex>
              )}
            </ModalBody>
            <ModalFooter bg="gray.50" roundedBottom="xl" py={4}>
              <Button colorScheme="purple" mr={3} onClick={() => setIsProjectQuarterlyModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Project Summary Modal */}
        <Modal isOpen={isProjectSummaryModalOpen} onClose={() => setIsProjectSummaryModalOpen(false)} size="6xl">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent maxH="90vh" bg="white" shadow="2xl" rounded="xl">
            <ModalHeader 
              bg="blue.500" 
              color="white" 
              roundedTop="xl" 
              py={4}
              fontSize="lg"
              fontWeight="bold"
            >
              <HStack>
                <Icon as={FiTrendingUp} />
                <Text>Project Summary - All Data (Q{selectedQuarter} {selectedYear})</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody overflowY="auto" maxH="70vh" p={6}>
              {chartData.length > 0 ? (
                <Box>
                  <Box bg="gray.50" p={4} rounded="lg" mb={4}>
                    <Chart
                      options={chartOptions}
                      series={chartSeries}
                      type="donut"
                      height={400}
                    />
                  </Box>
                  <HStack justify="center" mt={4} spacing={6}>
                    <Box bg="blue.50" p={4} rounded="lg" textAlign="center">
                      <Stat>
                        <StatLabel color="blue.600" fontSize="sm" fontWeight="medium">Total Projects</StatLabel>
                        <StatNumber color="blue.600" fontSize="2xl" fontWeight="bold">
                          {chartData.reduce((sum, item) => sum + item.projectCount, 0)}
                        </StatNumber>
                      </Stat>
                    </Box>
                  </HStack>
                </Box>
              ) : (
                <Flex justify="center" align="center" height="300px" direction="column">
                  <Icon as={FiTrendingUp} size="48px" color="gray.300" mb={4} />
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    No project summary data available
                  </Text>
                </Flex>
              )}
            </ModalBody>
            <ModalFooter bg="gray.50" roundedBottom="xl" py={4}>
              <Button colorScheme="blue" mr={3} onClick={() => setIsProjectSummaryModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Project Characteristics Modal */}
        <Modal isOpen={isCharacteristicsModalOpen} onClose={() => setIsCharacteristicsModalOpen(false)} size="6xl">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent maxH="90vh" bg="white" shadow="2xl" rounded="xl">
            <ModalHeader 
              bg="orange.500" 
              color="white" 
              roundedTop="xl" 
              py={4}
              fontSize="lg"
              fontWeight="bold"
            >
              <HStack>
                <Icon as={FiActivity} />
                <Text>Project Characteristics - All Data (Q{selectedQuarter} {selectedYear})</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody overflowY="auto" maxH="70vh" p={6}>
              {characteristicsModalData.length > 0 ? (
                <Box>
                  <Box bg="gray.50" p={4} rounded="lg" mb={4}>
                    <Chart
                      options={{
                        ...characteristicsChartOptions,
                        xaxis: {
                          ...characteristicsChartOptions.xaxis,
                          categories: characteristicsModalData.map(item => item.characteristicName)
                        }
                      }}
                      series={[{
                        name: 'Projects',
                        data: characteristicsModalData.map(item => item.projectCount)
                      }]}
                      type="bar"
                      height={Math.max(400, characteristicsModalData.length * 30)}
                    />
                  </Box>
                  <HStack justify="center" mt={4} spacing={6}>
                    <Box bg="orange.50" p={4} rounded="lg" textAlign="center">
                      <Stat>
                        <StatLabel color="orange.600" fontSize="sm" fontWeight="medium">Total Characteristics</StatLabel>
                        <StatNumber color="orange.600" fontSize="2xl" fontWeight="bold">
                          {characteristicsModalData.length}
                        </StatNumber>
                      </Stat>
                    </Box>
                    <Box bg="blue.50" p={4} rounded="lg" textAlign="center">
                      <Stat>
                        <StatLabel color="blue.600" fontSize="sm" fontWeight="medium">Total Projects</StatLabel>
                        <StatNumber color="blue.600" fontSize="2xl" fontWeight="bold">
                          {characteristicsModalData.reduce((sum, item) => sum + item.projectCount, 0)}
                        </StatNumber>
                      </Stat>
                    </Box>
                  </HStack>
                </Box>
              ) : (
                <Flex justify="center" align="center" height="300px" direction="column">
                  <Icon as={FiActivity} size="48px" color="gray.300" mb={4} />
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    No project characteristics data available
                  </Text>
                </Flex>
              )}
            </ModalBody>
            <ModalFooter bg="gray.50" roundedBottom="xl" py={4}>
              <Button colorScheme="orange" mr={3} onClick={() => setIsCharacteristicsModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Project Type Modal */}
        <Modal isOpen={isProjectTypeModalOpen} onClose={() => setIsProjectTypeModalOpen(false)} size="6xl">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent maxH="90vh" bg="white" shadow="2xl" rounded="xl">
            <ModalHeader 
              bg="teal.500" 
              color="white" 
              roundedTop="xl" 
              py={4}
              fontSize="lg"
              fontWeight="bold"
            >
              <HStack>
                <Icon as={FiBarChart} />
                <Text>Project Type - All Data (Q{selectedQuarter} {selectedYear})</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody overflowY="auto" maxH="70vh" p={6}>
              {projectTypeModalData.length > 0 ? (
                <Box>
                  <Box bg="gray.50" p={4} rounded="lg" mb={4}>
                    <Chart
                      options={{
                        ...projectTypeChartOptions,
                        labels: projectTypeModalData.map(item => item.projectTypeName),
                        dataLabels: {
                          enabled: true,
                          formatter: (val: number, opts: any) => {
                            const count = projectTypeModalData[opts.seriesIndex]?.projectCount || 0;
                            return `${count}`;
                          }
                        }
                      }}
                      series={projectTypeModalData.map(item => item.projectCount)}
                      type="pie"
                      height={400}
                    />
                  </Box>
                  <HStack justify="center" mt={4} spacing={6}>
                    <Box bg="teal.50" p={4} rounded="lg" textAlign="center">
                      <Stat>
                        <StatLabel color="teal.600" fontSize="sm" fontWeight="medium">Total Types</StatLabel>
                        <StatNumber color="teal.600" fontSize="2xl" fontWeight="bold">
                          {projectTypeModalData.length}
                        </StatNumber>
                      </Stat>
                    </Box>
                    <Box bg="blue.50" p={4} rounded="lg" textAlign="center">
                      <Stat>
                        <StatLabel color="blue.600" fontSize="sm" fontWeight="medium">Total Projects</StatLabel>
                        <StatNumber color="blue.600" fontSize="2xl" fontWeight="bold">
                          {projectTypeModalData.reduce((sum, item) => sum + item.projectCount, 0)}
                        </StatNumber>
                      </Stat>
                    </Box>
                  </HStack>
                </Box>
              ) : (
                <Flex justify="center" align="center" height="300px" direction="column">
                  <Icon as={FiBarChart} size="48px" color="gray.300" mb={4} />
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    No project type data available
                  </Text>
                </Flex>
              )}
            </ModalBody>
            <ModalFooter bg="gray.50" roundedBottom="xl" py={4}>
              <Button colorScheme="teal" mr={3} onClick={() => setIsProjectTypeModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Procurement Work Program Modal */}
        <Modal isOpen={isProcurementModalOpen} onClose={() => setIsProcurementModalOpen(false)} size="6xl">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent maxH="90vh" bg="white" shadow="2xl" rounded="xl">
            <ModalHeader bg="pink.500" color="white" roundedTop="xl" py={4} fontSize="lg" fontWeight="bold">
              <HStack>
                <Icon as={FiTrendingUp} />
                <Text>Procurement Work Program - All Data (Q{selectedQuarter} {selectedYear})</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody overflowY="auto" maxH="70vh" p={6}>
              {procurementModalData.length > 0 ? (
                <Box>
                  <Box bg="gray.50" p={4} rounded="lg" mb={4}>
                    <Chart
                      options={{
                        ...procurementWorkProgramChartOptions,
                        labels: procurementModalData.map(item => item.procurementWorkProgramFlag)
                      }}
                      series={procurementModalData.map(item => item.projectCount)}
                      type="donut"
                      height={400}
                    />
                  </Box>
                  <HStack justify="center" mt={4} spacing={6}>
                    <Box bg="pink.50" p={4} rounded="lg" textAlign="center">
                      <Stat>
                        <StatLabel color="pink.600" fontSize="sm" fontWeight="medium">Total Programs</StatLabel>
                        <StatNumber color="pink.600" fontSize="2xl" fontWeight="bold">
                          {procurementModalData.length}
                        </StatNumber>
                      </Stat>
                    </Box>
                    <Box bg="blue.50" p={4} rounded="lg" textAlign="center">
                      <Stat>
                        <StatLabel color="blue.600" fontSize="sm" fontWeight="medium">Total Projects</StatLabel>
                        <StatNumber color="blue.600" fontSize="2xl" fontWeight="bold">
                          {procurementModalData.reduce((sum, item) => sum + item.projectCount, 0)}
                        </StatNumber>
                      </Stat>
                    </Box>
                  </HStack>
                </Box>
              ) : (
                <Flex justify="center" align="center" height="300px" direction="column">
                  <Icon as={FiTrendingUp} size="48px" color="gray.300" mb={4} />
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    No procurement work program data available
                  </Text>
                </Flex>
              )}
            </ModalBody>
            <ModalFooter bg="gray.50" roundedBottom="xl" py={4}>
              <Button colorScheme="pink" mr={3} onClick={() => setIsProcurementModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Project Acquisitions Modal */}
        <Modal isOpen={isAcquisitionsModalOpen} onClose={() => setIsAcquisitionsModalOpen(false)} size="6xl">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent maxH="90vh" bg="white" shadow="2xl" rounded="xl">
            <ModalHeader bg="cyan.500" color="white" roundedTop="xl" py={4} fontSize="lg" fontWeight="bold">
              <HStack>
                <Icon as={FiActivity} />
                <Text>Project Acquisitions - All Data (Q{selectedQuarter} {selectedYear})</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody overflowY="auto" maxH="70vh" p={6}>
              {acquisitionsModalData.length > 0 ? (
                <Box>
                  <Box bg="gray.50" p={4} rounded="lg" mb={4}>
                    <Chart
                      options={{
                        ...projectAcquisitionsChartOptions,
                        xaxis: {
                          ...projectAcquisitionsChartOptions.xaxis,
                          categories: acquisitionsModalData.map(item => item.projectAcquisitionName)
                        }
                      }}
                      series={[{
                        name: 'Projects',
                        data: acquisitionsModalData.map(item => item.projectCount)
                      }]}
                      type="bar"
                      height={Math.max(400, acquisitionsModalData.length * 30)}
                    />
                  </Box>
                  <HStack justify="center" mt={4} spacing={6}>
                    <Box bg="cyan.50" p={4} rounded="lg" textAlign="center">
                      <Stat>
                        <StatLabel color="cyan.600" fontSize="sm" fontWeight="medium">Total Acquisitions</StatLabel>
                        <StatNumber color="cyan.600" fontSize="2xl" fontWeight="bold">
                          {acquisitionsModalData.length}
                        </StatNumber>
                      </Stat>
                    </Box>
                    <Box bg="blue.50" p={4} rounded="lg" textAlign="center">
                      <Stat>
                        <StatLabel color="blue.600" fontSize="sm" fontWeight="medium">Total Projects</StatLabel>
                        <StatNumber color="blue.600" fontSize="2xl" fontWeight="bold">
                          {acquisitionsModalData.reduce((sum, item) => sum + item.projectCount, 0)}
                        </StatNumber>
                      </Stat>
                    </Box>
                  </HStack>
                </Box>
              ) : (
                <Flex justify="center" align="center" height="300px" direction="column">
                  <Icon as={FiActivity} size="48px" color="gray.300" mb={4} />
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    No project acquisitions data available
                  </Text>
                </Flex>
              )}
            </ModalBody>
            <ModalFooter bg="gray.50" roundedBottom="xl" py={4}>
              <Button colorScheme="cyan" mr={3} onClick={() => setIsAcquisitionsModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Project by Group Management Modal */}
        <Modal isOpen={isGroupManageModalOpen} onClose={() => setIsGroupManageModalOpen(false)} size="6xl">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent maxH="90vh" bg="white" shadow="2xl" rounded="xl">
            <ModalHeader bg="purple.500" color="white" roundedTop="xl" py={4} fontSize="lg" fontWeight="bold">
              <HStack>
                <Icon as={FiBarChart} />
                <Text>Project by Group Management - All Data (Q{selectedQuarter} {selectedYear})</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody overflowY="auto" maxH="70vh" p={6}>
              {groupManageModalData.length > 0 ? (
                <Box>
                  <Box bg="gray.50" p={4} rounded="lg" mb={4}>
                    <Chart
                      options={{
                        ...projectByGroupManageChartOptions,
                        xaxis: {
                          ...projectByGroupManageChartOptions.xaxis,
                          categories: groupManageModalData.map(item => formatGroupName(item.projectGroupNameManage))
                        }
                      }}
                      series={[{
                        name: 'Projects',
                        data: groupManageModalData.map(item => item.projectCount)
                      }]}
                      type="bar"
                      height={Math.max(400, groupManageModalData.length * 30)}
                    />
                  </Box>
                  <HStack justify="center" mt={4} spacing={6}>
                    <Box bg="purple.50" p={4} rounded="lg" textAlign="center">
                      <Stat>
                        <StatLabel color="purple.600" fontSize="sm" fontWeight="medium">Total Groups</StatLabel>
                        <StatNumber color="purple.600" fontSize="2xl" fontWeight="bold">
                          {groupManageModalData.length}
                        </StatNumber>
                      </Stat>
                    </Box>
                    <Box bg="blue.50" p={4} rounded="lg" textAlign="center">
                      <Stat>
                        <StatLabel color="blue.600" fontSize="sm" fontWeight="medium">Total Projects</StatLabel>
                        <StatNumber color="blue.600" fontSize="2xl" fontWeight="bold">
                          {groupManageModalData.reduce((sum, item) => sum + item.projectCount, 0)}
                        </StatNumber>
                      </Stat>
                    </Box>
                  </HStack>
                </Box>
              ) : (
                <Flex justify="center" align="center" height="300px" direction="column">
                  <Icon as={FiBarChart} size="48px" color="gray.300" mb={4} />
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    No project by group management data available
                  </Text>
                </Flex>
              )}
            </ModalBody>
            <ModalFooter bg="gray.50" roundedBottom="xl" py={4}>
              <Button colorScheme="purple" mr={3} onClick={() => setIsGroupManageModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Project Summary Dev Modal */}
        <Modal isOpen={isProjectSummaryDevModalOpen} onClose={() => setIsProjectSummaryDevModalOpen(false)} size="6xl">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent maxH="90vh" bg="white" shadow="2xl" rounded="xl">
            <ModalHeader bg="blue.500" color="white" roundedTop="xl" py={4} fontSize="lg" fontWeight="bold">
              <HStack>
                <Icon as={FiBarChart} />
                <Text>Project Summary Dev - All Data (Q{selectedQuarter} {selectedYear})</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody overflowY="auto" maxH="70vh" p={6}>
              {projectSummaryDevModalData.length > 0 ? (
                <Box>
                  <Box bg="gray.50" p={4} rounded="lg" mb={4}>
                    <Chart
                      options={{
                        ...projectSummaryDevChartOptions,
                        labels: ['Active Projects', 'Closed Projects']
                      }}
                      series={[
                        projectSummaryDevModalData.filter(item => {
                          const status = item.projectStatus?.toUpperCase();
                          return status?.includes('ACTIVE') || status?.includes('INITIATE') || status?.includes('PROGRESS') || status?.includes('PLANNING');
                        }).reduce((sum, item) => sum + item.projectCount, 0),
                        projectSummaryDevModalData.filter(item => {
                          const status = item.projectStatus?.toUpperCase();
                          return status?.includes('CLOSED') || status?.includes('COMPLETE') || status?.includes('FINISH');
                        }).reduce((sum, item) => sum + item.projectCount, 0)
                      ]}
                      type="donut"
                      height={400}
                    />
                  </Box>
                  <HStack justify="center" mt={4} spacing={6}>
                    <Box bg="blue.50" p={4} rounded="lg" textAlign="center">
                      <Stat>
                        <StatLabel color="blue.600" fontSize="sm" fontWeight="medium">Total Records</StatLabel>
                        <StatNumber color="blue.600" fontSize="2xl" fontWeight="bold">
                          {projectSummaryDevModalData.length}
                        </StatNumber>
                      </Stat>
                    </Box>
                    <Box bg="green.50" p={4} rounded="lg" textAlign="center">
                      <Stat>
                        <StatLabel color="green.600" fontSize="sm" fontWeight="medium">Total Projects</StatLabel>
                        <StatNumber color="green.600" fontSize="2xl" fontWeight="bold">
                          {projectSummaryDevModalData.reduce((sum, item) => sum + item.projectCount, 0)}
                        </StatNumber>
                      </Stat>
                    </Box>
                  </HStack>
                </Box>
              ) : (
                <Flex justify="center" align="center" height="300px" direction="column">
                  <Icon as={FiBarChart} size="48px" color="gray.300" mb={4} />
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    No project summary dev data available
                  </Text>
                </Flex>
              )}
            </ModalBody>
            <ModalFooter bg="gray.50" roundedBottom="xl" py={4}>
              <Button colorScheme="blue" mr={3} onClick={() => setIsProjectSummaryDevModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Update Report Confirmation Modal */}
        <Modal isOpen={isUpdateConfirmOpen} onClose={() => setIsUpdateConfirmOpen(false)} size="md">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent bg="white" shadow="2xl" rounded="xl">
            <ModalHeader bg="orange.500" color="white" roundedTop="xl" py={4} fontSize="lg" fontWeight="bold">
              <HStack>
                <Icon as={FiActivity} />
                <Text>Update Report Confirmation</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody p={6}>
              <VStack spacing={4} align="start">
                <Text fontSize="md" color="gray.700">
                  This will update all report snapshots with current data. This process may take several minutes.
                </Text>
                <Box bg="yellow.50" p={4} rounded="lg" w="full">
                  <HStack>
                    <Icon as={FiActivity} color="yellow.600" />
                    <Text fontSize="sm" color="yellow.800" fontWeight="medium">
                      Warning: Report data processing takes time. Please do not close this page during the update.
                    </Text>
                  </HStack>
                </Box>
                <Text fontSize="sm" color="gray.600">
                  The following reports will be updated:
                </Text>
                <Box bg="gray.50" p={3} rounded="md" w="full">
                  <Text fontSize="xs" color="gray.600">
                    • Project Summary • Project Characteristics • Project Type<br/>
                    • Procurement Work Program • Project Acquisitions<br/>
                    • Project by Group Manage • Project Quarterly<br/>
                    • Division Owner Quartile • User Project Data
                  </Text>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter bg="gray.50" roundedBottom="xl" py={4}>
              <Button variant="ghost" mr={3} onClick={() => setIsUpdateConfirmOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="orange" onClick={handleUpdateReport}>
                Update All Reports
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Update Progress Overlay */}
        {isUpdating && (
          <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="blackAlpha.600"
            zIndex="9999"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Box bg="white" p={8} rounded="xl" shadow="2xl" maxW="md" w="90%">
              <VStack spacing={6}>
                <HStack>
                  <Icon as={FiActivity} color="orange.500" boxSize={6} />
                  <Text fontSize="lg" fontWeight="bold" color="gray.800">
                    Updating Reports
                  </Text>
                </HStack>
                
                <Box w="full">
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    {updateStatus || 'Preparing update...'}
                  </Text>
                  <Box bg="gray.200" rounded="full" h="2" w="full">
                    <Box
                      bg="orange.500"
                      h="2"
                      rounded="full"
                      transition="width 0.3s"
                      width={`${updateProgress}%`}
                    />
                  </Box>
                  <Text fontSize="xs" color="gray.500" mt={1} textAlign="center">
                    {Math.round(updateProgress)}% Complete
                  </Text>
                </Box>

                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Please wait while we update all report data.<br/>
                  This process may take a few minutes.
                </Text>
              </VStack>
            </Box>
          </Box>
        )}
      </Box>
    </LayoutAdmin>
  );
}
