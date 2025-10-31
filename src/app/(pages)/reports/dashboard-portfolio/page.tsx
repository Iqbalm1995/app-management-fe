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
} from "@chakra-ui/react";
import { useState } from "react";
import { getCurrentQuarter } from "@/app/helper/MasterHelper";

export default function DashboardPortfolioPage() {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedQuarter, setSelectedQuarter] = useState<string>(getCurrentQuarter().toString());

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

  const handleFilter = () => {
    console.log("Filter applied:", { year: selectedYear, quarter: selectedQuarter });
  };

  return (
    <LayoutAdmin>
      <HeaderContent {...headerProps} />
      <Box p={6}>
        <Card>
          <CardBody>
            <Flex justify="space-between" align="center" mb={6}>
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
                
                <Button colorScheme="blue" onClick={handleFilter}>
                  Filter
                </Button>
              </HStack>
            </Flex>

            <Tabs variant="solid-rounded" colorScheme="blue">
              <TabPanels>
                <TabPanel>
                  <Box minH="400px" p={4}>
                    <Text color="gray.500">General dashboard content will be here</Text>
                  </Box>
                </TabPanel>
                <TabPanel>
                  <Box minH="400px" p={4}>
                    <Text color="gray.500">Special dashboard content will be here</Text>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </Box>
    </LayoutAdmin>
  );
}
